const mongoose = require("mongoose");

const logSchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    from: {
      type: String,
      required: true,
      enum: ["application", "member"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
