const asyncHandler = require("express-async-handler");
const Application = require("../models/Application.model.js");
const Member = require("../models/Member.model.js");
const generateUniqueId = require("../utils/idGenerator.js");
const Notification = require("../models/Notification.model.js");

// Register application and create notifaction
const registerApplication = asyncHandler(async (req, res) => {
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

  // Check if the application already exists
  const applicationExists = await Application.findOne({ email });
  if (applicationExists) {
    res.status(400);
    throw new Error("Application already exists");
  }

  // Create the new application
  const application = await Application.create({
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
  });

  if (application) {
    // Create a notification for the new application
    const notification = await Notification.create({
      type: "application",
      message: `New application from ${firstName} ${lastName}`,
      applicationId: application._id,
    });

    // Emit real-time notification using Socket.io (if available)
    const io = req.app.get("io");
    if (io) {
      io.emit("newApplication", { notification });
    }

    res.status(201).json(application);
  } else {
    res.status(400);
    throw new Error("Invalid application data");
  }
});

// Fetch all applications
const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({});

  // Emit the event with the applications data
  const io = req.app.get("io");
  io.emit("applicationsFetched", applications);

  res.json(applications);
});

// Get application by ID
const getApplicationById = asyncHandler(async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (application) {
      res.status(200).json(application);
    } else {
      res.status(404).json({
        error:
          "Application not found. The ID might be invalid or the application was deleted.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the application",
      details: error.message,
    });
  }
});

// Update application by ID
const updateApplication = asyncHandler(async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        error: "Application not found. The ID may be invalid or does not exist.",
      });
    }

    // Update fields if provided in the request body
    application.firstName = req.body.firstName || application.firstName;
    application.lastName = req.body.lastName || application.lastName;
    application.email = req.body.email || application.email;
    application.personalPhoneNumber = req.body.personalPhoneNumber || application.personalPhoneNumber;
    application.address = req.body.address || application.address;
    application.gender = req.body.gender || application.gender;
    application.dob = req.body.dob || application.dob;
    application.emergencyContact = req.body.emergencyContact || application.emergencyContact;
    application.additionalInfo = req.body.additionalInfo || application.additionalInfo;
    application.membershipType = req.body.membershipType || application.membershipType;
    application.membershipPeriod = req.body.membershipPeriod || application.membershipPeriod;
    application.membershipStartDate = req.body.membershipStartDate || application.membershipStartDate;

    // Save updated application
    const updatedApplication = await application.save();

    res.status(200).json({
      message: "Application successfully updated",
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while updating the application",
      details: error.message,
    });
  }
});

// Delete application by ID
const deleteApplication = asyncHandler(async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (application) {
      await Application.deleteOne({ _id: application._id });
      res.status(200).json({
        message: "Application successfully removed",
        id: application._id,
      });
    } else {
      res.status(404).json({
        error:
          "Application not found. It may already be deleted or the ID is invalid.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while deleting the application",
      details: error.message,
    });
  }
});

// Approve application and create a member with generated custom memberID
const approveApplication = asyncHandler(async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        error: "Application not found. The ID may be invalid or does not exist.",
      });
    }

    if (application.status === "approved") {
      return res.status(400).json({
        error: "Application is already approved.",
      });
    }

    // Generate the memberId
    const memberId = await generateUniqueId();

    // Create a new member from the application
    const member = await Member.create({
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      personalPhoneNumber: application.personalPhoneNumber,
      address: application.address,
      gender: application.gender,
      dob: application.dob,
      emergencyContact: application.emergencyContact,
      additionalInfo: application.additionalInfo,
      membershipType: application.membershipType,
      membershipPeriod: application.membershipPeriod,
      membershipStartDate: application.membershipStartDate,
      memberId,
    });


    // Update the application status to 'approved'
    application.status = "approved";
    await application.save();

    // Remove the approved application from the Application collection
    await Application.deleteOne({ _id: application._id });

    // Emit event to notify all connected clients about the new member
    const io = req.app.get("io");
    io.emit("newMember", member);

    // Emit event to notify all connected clients about the application approval
    io.emit("applicationApproved", { applicationId: application._id, member });

    res.status(201).json({
      message: "Application approved, member created, and application removed successfully",
      member,
    });
  } catch (error) {
    console.error("Error in approveApplication:", error);
    res.status(500).json({
      error: "An error occurred while approving the application",
      details: error.message,
    });
  }
});

// Filter applications
const filterApplications = asyncHandler(async (req, res) => {
  const { membershipType, gender, dateRange } = req.query;
  const filter = {};

  // Apply membershipType filter if provided
  if (membershipType) {
    if (!["basic", "premium"].includes(membershipType)) {
      return res.status(400).json({ error: "Invalid membershipType value" });
    }
    filter.membershipType = membershipType;
  }

  // Apply gender filter if provided
  if (gender) {
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value" });
    }
    filter.gender = gender;
  }

  // Apply dateRange filter if provided
  if (dateRange) {
    let startDate;

    switch (dateRange) {
      case "day":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return res.status(400).json({ error: "Invalid dateRange value" });
    }

    filter.createdAt = { $gte: startDate };
  }

  try {
    const applications = await Application.find(filter);
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error filtering applications:", error);
    res.status(500).json({
      error: "An error occurred while filtering applications",
      details: error.message,
    });
  }
});

module.exports = {
  registerApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
  filterApplications,
};
