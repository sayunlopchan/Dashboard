const Member = require("../models/Member.model.js");
const asyncHandler = require("express-async-handler");
const generateUniqueId = require("../utils/idGenerator.js");

// Register a new member
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

    // Calculate membershipEndDate based on membershipPeriod
    let membershipEndDate = new Date(startDate);
    switch (membershipPeriod) {
      case "1 month":
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
        break;
      case "3 months":
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 3);
        break;
      case "1 year":
        membershipEndDate.setFullYear(membershipEndDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid membership period" });
    }

    // Create the new member
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
        phoneNumber: emergencyContact?.phoneNumber,
      },
      additionalInfo: additionalInfo || "none",
      membershipType,
      membershipPeriod,
      memberId,
      membershipStartDate: startDate,
      membershipEndDate,
    });

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("membersData", { members: await Member.find({}) });

    return res.status(201).json(member);
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

// Search members by first/laclearst name, name, memberId, or email
const searchMembers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const members = await Member.find({
      $or: [
        // Match if firstName contains the query
        { firstName: { $regex: query, $options: "i" } },
        // Match if lastName contains the query
        { lastName: { $regex: query, $options: "i" } },
        // Match if email contains the query
        { email: { $regex: query, $options: "i" } },
        // Match if memberId contains the query
        { memberId: { $regex: query, $options: "i" } },
        // Match if the concatenated full name (firstName + " " + lastName) contains the query
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: query,
              options: "i",
            },
          },
        },
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
      res
        .status(200)
        .json({ message: "Member successfully removed", id: member._id });
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

// Renew Membership TYPE/PERIOD
const renewAndPayMembership = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { membershipPeriod, membershipType } = req.body;

  try {
    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Validate inputs
    const validPeriods = ["1 month", "3 months", "1 year"];
    const validTypes = ["basic", "premium"];

    // Always track the current membership type before updating it
    member.membershipTypeHistory.push(member.membershipType);
    member.membershipType = membershipType || member.membershipType;

    // Always track the current membership period before updating it
    member.membershipPeriodHistory.push(member.membershipPeriod);
    member.membershipPeriod = membershipPeriod || member.membershipPeriod;

    // Validate membership period
    if (!validPeriods.includes(member.membershipPeriod)) {
      return res.status(400).json({ error: "Invalid membership period" });
    }

    // Calculate new end date
    let baseDate = new Date(member.membershipEndDate);
    if (baseDate < new Date()) {
      baseDate = new Date(); // If expired, start from now
    }

    const newEndDate = new Date(baseDate);
    switch (member.membershipPeriod) {
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

    // Update membership details
    member.membershipEndDate = newEndDate;
    member.renewCount = (member.renewCount || 0) + 1;
    member.renew = true;
    member.renewDate = [...(member.renewDate || []), new Date()];

    await member.save();

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("membersData", { members: await Member.find({}) });

    return res.status(200).json({
      message: `Membership extended until ${newEndDate.toISOString()}`,
      member,
      typeHistory: member.membershipTypeHistory,
      periodHistory: member.membershipPeriodHistory,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while renewing membership",
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
