// models/Notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["application", "membership"],
    },
    message: {
      type: String,
      required: true,
    },
    // Only present for application‐type notifications
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: function () {
        return this.type === "application";
      },
    },
    // Only present for membership‐type notifications
    memberId: {
      type: String,
      required: function () {
        return this.type === "membership";
      },
    },
    // Track which threshold triggered it
    threshold: {
      type: Number,
      required: function () {
        return this.type === "membership";
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
