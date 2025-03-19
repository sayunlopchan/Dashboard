const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    personalPhoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
    additionalInfo: {
      type: String,
      default: "none",
    },
    membershipType: {
      type: String,
      required: true,
      enum: ["basic", "premium"],
    },
    membershipPeriod: {
      type: String,
      required: true,
      enum: ["1 month", "3 months", "1 year"],
    },
    membershipStartDate: {
      type: Date,
      required: true,
    },
    membershipEndDate: {
      type: Date,
      required: false,
    },
    memberId: {
      type: String,
      unique: true,
      required: true,
    },
    renew: {
      type: Boolean,
      default: false,
    },
    renewCount: {
      type: Number,
      default: 0,
    },
    extendDate: [
      {
        type: Date,
      },
    ],
    payment: [
      {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid",
      },
    ],
    paymentAmt: [
      {
        type: Number,
      },
    ],
    paymentDate: [
      {
        type: Date,
      },
    ],
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
