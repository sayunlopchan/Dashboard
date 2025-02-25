const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// Fetch all notifications (newest first)
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark a notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  res.json({ message: "Notification marked as read", notification });
});

module.exports = { getNotifications, markAsRead };
