const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification.model");

// Fetch all notifications (newest first) with populated application data
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate("applicationId")
    .sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// Mark a single notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ message: "Notification marked as read", notification });
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { isRead: true });
  res.status(200).json({ message: "All notifications marked as read" });
});

// Delete a single notification by ID
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  await notification.remove();
  res.status(200).json({ message: "Notification deleted", id: req.params.id });
});

// Delete all notifications
const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({});
  res.status(200).json({ message: "All notifications deleted" });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
