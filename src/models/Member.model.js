import mongoose from "mongoose";

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
    },
    personalPhoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
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
      address: {
        type: String,
        required: true,
      },
    },
    medicalInfo: {
      type: String,
      default: "",
    },
    approvedAt: {
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

export default Member;
