import Member from "../models/Member.model.js";
import Log from "../models/Log.model.js";
import asyncHandler from "express-async-handler";

// Register a new member with a default "pending" payment record
const registerMember = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    personalPhoneNumber,
    address,
    emergencyContact,
    medicalInfo,
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
  res.json(members);
});

// Get member by ID
const getMemberById = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (member) {
      res.status(200).json(member);
    } else {
      res.status(404).json({
        error:
          "Member not found. The ID might be invalid or the member was deleted.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the member",
      details: error.message,
    });
  }
});

// Get member by memberId
const getMemberByMemberId = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findOne({ memberId: req.params.memberId });

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

// Update member by ID
const updateMember = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        error: "Member not found. The ID may be invalid or does not exist.",
      });
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
        personalPhoneNumber:
          req.body.personalPhoneNumber || member.personalPhoneNumber,
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

    res
      .status(200)
      .json({ message: "Member successfully updated", member: updatedMember });
  } catch (error) {
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
      // Log the deletion action with "from: member"
      await Log.create({
        action: "deleted",
        data: member.toObject(),
        from: "member",
      });

      await Member.deleteOne({ _id: member._id });
      res
        .status(200)
        .json({ message: "Member successfully removed", id: member._id });
    } else {
      res.status(404).json({
        error:
          "Member not found. It may already be deleted or the ID is invalid.",
      });
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
        startDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() - 1)
        );
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

// Renew (Extend) Membership and Process Payment
const renewAndPayMembership = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { membershipPeriod, paymentAmount } = req.body;

  // Validate paymentAmount
  if (paymentAmount == null || typeof paymentAmount !== "number") {
    return res
      .status(400)
      .json({ error: "Payment amount must be provided as a number" });
  }

  try {
    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Use membership period from the database if not provided in req.body
    const validPeriods = ["1 month", "3 months", "1 year"];
    let period = membershipPeriod || member.membershipPeriod;

    if (!validPeriods.includes(period)) {
      return res
        .status(400)
        .json({ error: "Invalid membership period selected" });
    }
    console.log("Before: ", member.membershipPeriod);
    // Update the membershipPeriod in the database if provided
    if (membershipPeriod) {
      member.membershipPeriod = membershipPeriod;
    }
    console.log("After: ", member.membershipPeriod);
    // Initialize payment arrays if needed
    member.payment = member.payment || [];
    member.paymentAmt = member.paymentAmt || [];
    member.paymentDate = member.paymentDate || [];

    // Remove any existing pending payment before processing
    if (
      member.payment.length > 0 &&
      member.payment[member.payment.length - 1] === "pending"
    ) {
      member.payment.pop();
      member.paymentAmt.pop();
      member.paymentDate.pop();
    }

    // Process Payment Entry
    if (paymentAmount > 0) {
      member.payment.push("paid");
      member.paymentAmt.push(paymentAmount);
      member.paymentDate.push(new Date());
    } else {
      member.payment.push("pending");
      member.paymentAmt.push(0);
      member.paymentDate.push(new Date());
    }

    // Determine if this is the first activation (no membershipEndDate exists)
    const isFirstActivation = !member.membershipEndDate;

    if (isFirstActivation) {
      // First Payment: Create membershipEndDate based on provided period (or stored period)
      let baseDate =
        member.membershipStartDate &&
        new Date(member.membershipStartDate) > new Date()
          ? new Date(member.membershipStartDate)
          : new Date();

      let newEndDate = new Date(baseDate);
      switch (period) {
        case "1 month":
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          break;
        case "3 months":
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          break;
        case "1 year":
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          break;
      }
      member.membershipEndDate = newEndDate;
      // Do NOT update renewal fields on first activation.
    } else {
      // Renewal Payment: Extend the current membershipEndDate.
      let baseDate = new Date(member.membershipEndDate);
      if (baseDate < new Date()) {
        baseDate = new Date(); // if expired, start from now
      }
      let newEndDate = new Date(baseDate);
      switch (period) {
        case "1 month":
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          break;
        case "3 months":
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          break;
        case "1 year":
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          break;
      }
      member.membershipEndDate = newEndDate;
      member.renewCount = (member.renewCount || 0) + 1;
      member.renew = true;
      member.extendDate = [...(member.extendDate || []), new Date()];
    }

    await member.save();

    // Emit update event
    const io = req.app.get("io");
    if (io) {
      io.emit("membershipRenewedAndPaid", member);
    }

    const message = isFirstActivation
      ? "Payment processed successfully. Membership activated."
      : `Payment processed successfully. Membership extended until ${member.membershipEndDate.toISOString()}`;

    return res.status(200).json({ message, member });
  } catch (error) {
    return res.status(500).json({
      error:
        "An error occurred while processing payment and updating membership.",
      details: error.message,
    });
  }
});

module.exports = {
  registerMember,
  getMembers,
  getMemberById,
  getMemberByMemberId,
  updateMember,
  deleteMember,
  filterMembers,
  searchMembers,
  renewAndPayMembership,
};
