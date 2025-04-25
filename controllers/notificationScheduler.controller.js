const dotenv = require("dotenv");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Member = require("../models/Member.model");
const Notification = require("../models/Notification.model");
const transporter = require("../config/emailConfig"); // Import transporter

dotenv.config();

const NOTIFICATION_THRESHOLDS = [7, 6, 5, 4, 3, 2, 1, 0];

const calculateDaysDifference = (endDate, currentDate) => {
  const diffMs = new Date(endDate) - currentDate;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const buildExpiryMessage = (firstName, daysLeft) => {
  if (daysLeft <= 0) {
    return `${firstName}'s membership has expired.`;
  }
  return `${firstName}'s membership will expire in ${daysLeft} day${
    daysLeft > 1 ? "s" : ""
  }.`;
};

const getHtmlTemplate = (firstName, message) => {
  const templatePath = path.join(__dirname, "../public/emailTemplate.html");
  let template = fs.readFileSync(templatePath, "utf-8");
  template = template.replace("{{firstName}}", firstName);
  template = template.replace("{{message}}", message);
  return template;
};

const sendEmailNotification = async (to, subject, firstName, message) => {
  const htmlContent = getHtmlTemplate(firstName, message);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  });
  console.log(`📧 HTML email sent to ${to}`);
};

const sendExpiryNotifications = async (io) => {
  const now = new Date();
  try {
    const members = await Member.find({});
    for (const m of members) {
      const daysLeft = calculateDaysDifference(m.membershipEndDate, now);
      for (const threshold of NOTIFICATION_THRESHOLDS) {
        if (daysLeft === threshold || (threshold === 0 && daysLeft < 0)) {
          const already = await Notification.findOne({
            type: "membership",
            memberId: m.memberId,
            threshold,
            date: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
          });
          if (already) continue;

          const msg = buildExpiryMessage(m.firstName, daysLeft);
          const notif = await Notification.create({
            type: "membership",
            memberId: m.memberId,
            threshold,
            message: msg,
            date: new Date(),
          });
          io?.emit("newNotification", notif);

          await sendEmailNotification(
            m.email,
            "Membership Expiry Reminder",
            m.firstName,
            msg
          );
          console.log(`📢 Notified ${m.memberId} (${m.email}): "${msg}"`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in sendExpiryNotifications:", err);
  }
};

const scheduleExpiryJob = (io) => {
  const cronExpr = process.env.EXPIRY_CRON_SCHEDULE || "0 0 * * *";
  console.log(`🗓️ Scheduling expiry job: "${cronExpr}" UTC`);
  cron.schedule(
    cronExpr,
    () => {
      console.log("🚀 Running expiry notification job...");
      sendExpiryNotifications(io);
    },
    { timezone: "UTC" }
  );
};

module.exports = scheduleExpiryJob;
