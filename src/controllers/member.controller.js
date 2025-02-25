const Member = require("../models/Member.model.js");
const asyncHandler = require("express-async-handler");
const generateUniqueId = require("../utils/idGenerator.js");

// Register a new member with a default "pending" payment record
const registerMember = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    personalPhoneNumber,
    address,
    gender,
    dob,
    emergencyContact,
    additionalInfo,
    membershipType,
    membershipPeriod,
    membershipStartDate,
  } = req.body;

  // Check if member already exists
  const memberExists = await Member.findOne({ email });
  if (memberExists) {
    return res.status(400).json({ error: "Member already exists" });
  }

  try {
    // Generate the unique memberId
    const memberId = await generateUniqueId();

    const startDate = new Date(membershipStartDate);
    const dobDate = new Date(dob);

    let membershipEndDate;
    if (membershipPeriod === "1 year") {
      membershipEndDate = new Date(startDate);
      membershipEndDate.setFullYear(startDate.getFullYear() + 1);
    } else if (membershipPeriod === "6 months") {
      membershipEndDate = new Date(startDate);
      membershipEndDate.setMonth(startDate.getMonth() + 6);
    } else if (membershipPeriod === "3 months") {
      membershipEndDate = new Date(startDate);
      membershipEndDate.setMonth(startDate.getMonth() + 3);
    }

    // Create the new member with a default payment record ("pending") and default amount 0
    const member = await Member.create({
      firstName,
      lastName,
      email,
      personalPhoneNumber,
      address,
      gender,
      dob: dobDate,
      emergencyContact: {
        name: emergencyContact?.name,
        relationship: emergencyContact?.relationship,
        email: emergencyContact?.email,
        phoneNumber: emergencyContact?.phoneNumber,
      },
      additionalInfo: additionalInfo || "none",
      membershipType,
      membershipPeriod,
      memberId,
      membershipStartDate: startDate,
      membershipEndDate,
      payment: ["pending"],
      paymentAmt: [0],
    });

    if (member) {
      // Emit an event to notify clients about the new member
      const io = req.app.get("io");
      io.emit("newMember", member);

      return res.status(201).json(member);
    } else {
      return res.status(400).json({ error: "Invalid member data" });
    }
  } catch (error) {
    console.error("Error registering member:", error);
    return res.status(500).json({
      error: "An error occurred while registering the member",
      details: error.message,
    });
  }
});

// Get all members
const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find({});

  // Emit a Socket.IO event to send the list of members to clients
  const io = req.app.get("io");
  io.emit("membersFetched", members);

  res.json(members);
});

// Search members by name, memberId, or email
const searchMembers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const members = await Member.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { memberId: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while searching for members",
      details: error.message,
    });
  }
});

// Get member by ID
const getMemberById = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (member) {
      res.status(200).json(member);
    } else {
      res.status(404).json({ error: "Member not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the member",
      details: error.message,
    });
  }
});

// Update member by ID and recalculate membershipEndDate when needed
const updateMember = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Prevent email & memberId from being updated
    if (req.body.email && req.body.email !== member.email) {
      return res.status(400).json({ error: "Email cannot be changed" });
    }
    if (req.body.memberId && req.body.memberId !== member.memberId) {
      return res.status(400).json({ error: "Member ID cannot be changed" });
    }

    // Parse dates
    const updatedDob = req.body.dob ? new Date(req.body.dob) : member.dob;
    const updatedStartDate = req.body.membershipStartDate
      ? new Date(req.body.membershipStartDate)
      : member.membershipStartDate;

    // Calculate membershipEndDate based on updated membershipStartDate and membershipPeriod
    let membershipEndDate = member.membershipEndDate;
    if (req.body.membershipPeriod || req.body.membershipStartDate) {
      const period = req.body.membershipPeriod || member.membershipPeriod;
      membershipEndDate = new Date(updatedStartDate);
      if (period === "1 year") {
        membershipEndDate.setFullYear(membershipEndDate.getFullYear() + 1);
      } else if (period === "6 months") {
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 6);
      } else if (period === "3 months") {
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 3);
      }
    }

    // Update member
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName || member.firstName,
        lastName: req.body.lastName || member.lastName,
        personalPhoneNumber: req.body.personalPhoneNumber || member.personalPhoneNumber,
        address: req.body.address || member.address,
        gender: req.body.gender || member.gender,
        dob: updatedDob,
        emergencyContact: req.body.emergencyContact || member.emergencyContact,
        additionalInfo: req.body.additionalInfo || member.additionalInfo,
        membershipType: req.body.membershipType || member.membershipType,
        membershipPeriod: req.body.membershipPeriod || member.membershipPeriod,
        membershipStartDate: updatedStartDate,
        membershipEndDate: membershipEndDate,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Member successfully updated", member: updatedMember });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({
      error: "An error occurred while updating the member",
      details: error.message,
    });
  }
});

// Delete member by ID
const deleteMember = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (member) {
      await Member.deleteOne({ _id: member._id });
      res.status(200).json({ message: "Member successfully removed", id: member._id });
    } else {
      res.status(404).json({ error: "Member not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while deleting the member",
      details: error.message,
    });
  }
});

// Filter Members
const filterMembers = asyncHandler(async (req, res) => {
  const { membershipType, gender, dateRange } = req.query;
  const filter = {};

  if (membershipType) filter.membershipType = membershipType;
  if (gender) filter.gender = gender;

  if (dateRange) {
    const currentDate = new Date();
    let startDate;

    switch (dateRange) {
      case "day":
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
        break;
      case "month":
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      filter.createdAt = { $gte: startDate };
    }
  }

  try {
    const members = await Member.find(filter);
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while filtering members",
      details: error.message,
    });
  }
});

// Renew Membership and emit an event to notify clients
const renewMembership = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { membershipPeriod } = req.body;

  try {
    const member = await Application.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Validate the selected membership period based on the schema
    const validPeriods = ["1 day", "1 month", "3 months", "1 year"];
    if (!validPeriods.includes(membershipPeriod)) {
      return res.status(400).json({ error: "Invalid membership period selected" });
    }

    // Parse current membership start date or use today's date if not set
    const currentStartDate = member.membershipStartDate ? new Date(member.membershipStartDate) : new Date();
    let newEndDate = new Date(currentStartDate);

    // Increment the membership period based on renewal
    switch (membershipPeriod) {
      case "1 day":
        newEndDate.setDate(newEndDate.getDate() + 1);
        break;
      case "1 month":
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        break;
      case "3 months":
        newEndDate.setMonth(newEndDate.getMonth() + 3);
        break;
      case "1 year":
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        break;
      default:
        break;
    }

    // Update membership details
    member.membershipPeriod = membershipPeriod;
    member.membershipStartDate = currentStartDate;
    member.membershipEndDate = newEndDate;

    await member.save();

    // Emit an event to notify clients about the membership renewal
    const io = req.app.get("io");
    if (io) {
      io.emit("membershipRenewed", member);
    }

    res.status(200).json({
      message: "Membership successfully renewed",
      member,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while renewing membership",
      details: error.message,
    });
  }
});

// Updates the payment status and membership renewal
const updatePaymentAndRenewal = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { paymentAmount } = req.body;

  // Validate that paymentAmount is provided as a number.
  if (paymentAmount == null || typeof paymentAmount !== "number") {
    return res.status(400).json({ error: "Payment amount must be provided as a number" });
  }

  // Find the member by memberId.
  const member = await Member.findOne({ memberId });
  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  const now = new Date();

  // CASE 1: Membership period is over (i.e. the due date has passed).
  if (now >= member.membershipEndDate) {
    if (paymentAmount > 0) {
      // Check if this is the very first payment (joining payment).
      if (member.payment.length === 1 && member.payment[0] === "pending") {
        // Update the joining payment record to "paid" without processing a renewal.
        member.payment[0] = "paid";
        member.paymentAmt[0] = paymentAmount;
      } else {
        // Otherwise, this is a renewal payment.
        if (
          member.payment.length > 0 &&
          member.payment[member.payment.length - 1] === "pending"
        ) {
          member.payment[member.payment.length - 1] = "paid";
          member.paymentAmt[member.paymentAmt.length - 1] = paymentAmount;
        } else {
          member.payment.push("paid");
          member.paymentAmt.push(paymentAmount);
        }

        // Process renewal: increase renewCount and update membershipEndDate.
        member.renewCount = (member.renewCount || 0) + 1;
        let newEndDate = new Date(now);
        const period = member.membershipPeriod;
        switch (period) {
          case "1 day":
            newEndDate.setDate(newEndDate.getDate() + 1);
            break;
          case "1 month":
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            break;
          case "3 months":
            newEndDate.setMonth(newEndDate.getMonth() + 3);
            break;
          case "1 year":
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            break;
          default:
            break;
        }
        member.membershipEndDate = newEndDate;
        member.renew = true;
      }
    } else {
      // If no payment is made when due, ensure that the latest payment status remains "pending".
      if (
        member.payment.length === 0 ||
        member.payment[member.payment.length - 1] !== "pending"
      ) {
        member.payment.push("pending");
        member.paymentAmt.push(0);
      }
    }
  }
  // CASE 2: Membership period is still active.
  else {
    if (paymentAmount > 0) {
      if (
        member.payment.length > 0 &&
        member.payment[member.payment.length - 1] === "pending"
      ) {
        member.payment[member.payment.length - 1] = "paid";
        member.paymentAmt[member.paymentAmt.length - 1] = paymentAmount;
      } else {
        member.payment.push("paid");
        member.paymentAmt.push(paymentAmount);
      }
      // No renewal processing is done here.
    }
  }

  // Save the updated member details
  await member.save();

  // ----- Check conditions and create notifications for admin -----

  // Condition 1:
  // If membershipStartDate is about to start within the next 24 hours and payment is pending.
  if (member.membershipStartDate) {
    const diffStart = member.membershipStartDate - now;
    if (
      diffStart > 0 &&
      diffStart <= 24 * 60 * 60 * 1000 &&
      member.payment.length > 0 &&
      member.payment[member.payment.length - 1] === "pending"
    ) {
      await Notification.create({
        type: "membership",
        message: `Membership for ${member.firstName} ${member.lastName} is about to start, but payment is pending.`,
        applicationId: member._id,
      });
    }
  }

  // Condition 2:
  // If membershipPeriod is about to end within 7 days and has not been renewed.
  if (member.membershipEndDate) {
    const diffEnd = member.membershipEndDate - now;
    if (diffEnd > 0 && diffEnd <= 7 * 24 * 60 * 60 * 1000 && !member.renew) {
      await Notification.create({
        type: "membership",
        message: `Membership for ${member.firstName} ${member.lastName} is about to end and has not been renewed.`,
        applicationId: member._id,
      });
    }
  }

  // Condition 3:
  // If the membership period has ended.
  if (member.membershipEndDate && now >= member.membershipEndDate) {
    await Notification.create({
      type: "membership",
      message: `Membership for ${member.firstName} ${member.lastName} has ended.`,
      applicationId: member._id,
    });
  }

  // Emit an event to notify connected clients about the payment and renewal update.
  const io = req.app.get("io");
  if (io) {
    io.emit("paymentStatusUpdated", member);
  }

  return res.status(200).json({
    message: "Payment and renewal updated successfully",
    member,
  });
});




module.exports = {
  registerMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  filterMembers,
  searchMembers,
  renewMembership,
  updatePaymentAndRenewal,
};
