// models/ApplicationsData.model.js

const mongoose = require("mongoose");

const applicationsDataSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Application",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  membershipType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ApplicationsData", applicationsDataSchema);
