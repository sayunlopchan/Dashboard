const Member = require("../models/Member.model.js");
const Log = require("../models/Log.model.js");
const asyncHandler = require("express-async-handler");

// Register a new member
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

  const memberExists = await Member.findOne({ email });

  if (memberExists) {
    res.status(400);
    throw new Error("Member already exists");
  }

  const member = await Member.create({
    firstName,
    lastName,
    email,
    personalPhoneNumber,
    address,
    emergencyContact,
    medicalInfo,
  });

  if (member) {
    // Log the member creation action with "from: member"
    await Log.create({
      action: "created",
      data: member.toObject(),
      from: "member",
    });

    res.status(201).json(member);
  } else {
    res.status(400);
    throw new Error("Invalid member data");
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

// Update member by ID
const updateMember = asyncHandler(async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        error: "Member not found. The ID may be invalid or does not exist.",
      });
    }

    // Log the previous state of the member before updating
    await Log.create({
      action: "edited",
      data: member.toObject(),
      from: "member",
    });

    // Update fields if provided in the request body
    member.firstName = req.body.firstName || member.firstName;
    member.lastName = req.body.lastName || member.lastName;
    member.email = req.body.email || member.email;
    member.personalPhoneNumber =
      req.body.personalPhoneNumber || member.personalPhoneNumber;
    member.address = req.body.address || member.address;
    member.emergencyContact =
      req.body.emergencyContact || member.emergencyContact;
    member.medicalInfo = req.body.medicalInfo || member.medicalInfo;

    // Save updated member
    const updatedMember = await member.save();

    // Log the updated state of the member
    await Log.create({
      action: "edited",
      data: updatedMember.toObject(),
      from: "member",
    });

    res.status(200).json({
      message: "Member successfully updated",
      member: updatedMember,
    });
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
      res.status(200).json({
        message: "Member successfully removed",
        id: member._id,
      });
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

module.exports = {
  registerMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
