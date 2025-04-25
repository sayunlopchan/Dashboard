const dotenv = require("dotenv");
const cron = require("node-cron");
const Member = require("../models/Member.model");
const Notification = require("../models/Notification.model");

dotenv.config();

const NOTIFICATION_THRESHOLDS = [7, 5, 2, 1, 0];

// Helper: Calculate days between two dates
const calculateDaysDifference = (endDate, currentDate) => {
  const diffTime = new Date(endDate) - currentDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper: Compose expiry message
const buildExpiryMessage = (firstName, daysLeft) => {
  return daysLeft === 0
    ? `${firstName}'s membership has expired.`
    : `${firstName}'s membership will expire in ${daysLeft} day${
        daysLeft > 1 ? "s" : ""
      }.`;
};

// Main: Check and send expiry notifications
const sendExpiryNotifications = async (io) => {
  const now = new Date();

  try {
    const members = await Member.find({});

    for (const member of members) {
      const diff = new Date(member.membershipEndDate) - now;
      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

      for (const threshold of NOTIFICATION_THRESHOLDS) {
        // only create if threshold is less than or equal to totalDays,
        // and you haven’t already created it:
        if (totalDays >= threshold) {
          const exists = await Notification.findOne({
            type: "membership",
            memberId: member.memberId,
            threshold,
          });

          if (!exists) {
            const message = buildExpiryMessage(member.firstName, threshold);
            const newNotification = await Notification.create({
              type: "membership",
              memberId: member.memberId,
              threshold,
              message,
            });

            console.log(`📢 Notified ${member.memberId}: "${message}"`);

            io?.emit("newNotification", newNotification);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in sendExpiryNotifications:", error);
  }
};

// Scheduler: Run daily at specified cron time
const scheduleExpiryJob = (io) => {
  const defaultCron = "0 0 * * *"; // UTC 00:00
  const cronSchedule = process.env.EXPIRY_CRON_SCHEDULE || defaultCron;

  console.log(`🗓️  Scheduling expiry notifications: "${cronSchedule}" UTC`);

  cron.schedule(
    cronSchedule,
    () => {
      console.log("🚀 Running expiry notification job...");
      sendExpiryNotifications(io);
    },
    { timezone: "UTC" }
  );
};

module.exports = scheduleExpiryJob;
