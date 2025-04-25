const dotenv = require("dotenv");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Member = require("../models/Member.model");
const Notification = require("../models/Notification.model");

dotenv.config();

// Thresholds for sending notifications (7, 6, 5, 4, 3, 2, 1, 0)
const NOTIFICATION_THRESHOLDS = [7, 6, 5, 4, 3, 2, 1, 0];

// Helper: days between now and endDate (could be negative if already expired)
const calculateDaysDifference = (endDate, currentDate) => {
  const diffMs = new Date(endDate) - currentDate;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Helper: text for both email & in-app notification
const buildExpiryMessage = (firstName, daysLeft) => {
  if (daysLeft <= 0) {
    return `${firstName}'s membership has expired.`;
  }
  return `${firstName}'s membership will expire in ${daysLeft} day${
    daysLeft > 1 ? "s" : ""
  }.`;
};

// Helper: send email via Nodemailer
const sendEmailNotification = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
  console.log(`📧 Email sent to ${to}`);
};

// Main: for each member, check days left & notify if it matches a threshold
const sendExpiryNotifications = async (io) => {
  const now = new Date();
  try {
    const members = await Member.find({});

    for (const m of members) {
      const daysLeft = calculateDaysDifference(m.membershipEndDate, now);

      // Check all thresholds for notification
      for (const threshold of NOTIFICATION_THRESHOLDS) {
        // Send notification only if daysLeft is within the threshold
        if (daysLeft === threshold || (threshold === 0 && daysLeft < 0)) {
          // Avoid duplicate notifications for the same threshold on the same day
          const already = await Notification.findOne({
            type: "membership",
            memberId: m.memberId,
            threshold,
            date: { $gte: new Date(now.setHours(0, 0, 0, 0)) }, // Check for today's date
          });
          if (already) continue;

          const msg = buildExpiryMessage(m.firstName, daysLeft);
          // 1) store in DB (create new notification)
          const notif = await Notification.create({
            type: "membership",
            memberId: m.memberId,
            threshold,
            message: msg,
            date: new Date(),
          });
          // 2) emit via socket (if you're using socket.io)
          io?.emit("newNotification", notif);
          // 3) send email
          await sendEmailNotification(
            m.email,
            "Membership Expiry Reminder",
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

// Scheduler: run once a day at your cron schedule (default midnight UTC)
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
