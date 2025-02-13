const Application = require("../models/Application.model.js");
const Member = require("../models/Member.model.js");
const Log = require("../models/Log.model.js");
const asyncHandler = require("express-async-handler");

// Register a new application
const registerApplication = (io) =>
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      personalPhoneNumber,
      address,
      emergencyContact,
      medicalInfo,
    } = req.body;

    const applicationExists = await Application.findOne({ email });

    if (applicationExists) {
      res.status(400);
      throw new Error("Application already exists");
    }

    const application = await Application.create({
      firstName,
      lastName,
      email,
      personalPhoneNumber,
      address,
      emergencyContact,
      medicalInfo,
    });

    if (application) {
      // Log the new application registration
      await Log.create({
        action: "created",
        data: application.toObject(),
        from: "application",
      });

      res.status(201).json(application);
    } else {
      res.status(400);
      throw new Error("Invalid application data");
    }

    // Emit the applicationCreated event via Socket.io after the application is registered
    io.emit("applicationCreated", application);
  });

// Get all applications
const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({});
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
const updateApplication = (io) =>
  asyncHandler(async (req, res) => {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          error:
            "Application not found. The ID may be invalid or does not exist.",
        });
      }

      // Log the previous state of the application before updating
      await Log.create({
        action: "edited",
        data: application.toObject(),
        from: "application",
      });

      // Update fields if provided in the request body
      application.firstName = req.body.firstName || application.firstName;
      application.lastName = req.body.lastName || application.lastName;
      application.email = req.body.email || application.email;
      application.personalPhoneNumber =
        req.body.personalPhoneNumber || application.personalPhoneNumber;
      application.address = req.body.address || application.address;
      application.emergencyContact =
        req.body.emergencyContact || application.emergencyContact;
      application.medicalInfo = req.body.medicalInfo || application.medicalInfo;

      // Save updated application
      const updatedApplication = await application.save();

      // Log the updated state of the application
      await Log.create({
        action: "edited",
        data: updatedApplication.toObject(),
        from: "application",
      });

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
    io.emit("applicationUpdated", updatedApplication);
  });

// Delete application by ID
const deleteApplication = (io) =>
  asyncHandler(async (req, res) => {
    try {
      const application = await Application.findById(req.params.id);

      if (application) {
        // Log the deletion action
        await Log.create({
          action: "deleted",
          data: application.toObject(),
          from: "application",
        });

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
    io.emit("applicationDeleted", application._id);
  });

// Approve application and create a member
const approveApplication = (io) =>
  asyncHandler(async (req, res) => {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          error:
            "Application not found. The ID may be invalid or does not exist.",
        });
      }

      // Check if the application is already approved
      if (application.status === "approved") {
        return res.status(400).json({
          error: "Application is already approved.",
        });
      }

      // Create a new member from the application
      const member = await Member.create({
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        personalPhoneNumber: application.personalPhoneNumber,
        address: application.address,
        emergencyContact: application.emergencyContact,
        medicalInfo: application.medicalInfo,
      });

      // Update the application status to 'approved'
      application.status = "approved";
      await application.save();

      // Log the approval action
      await Log.create({
        action: "approved",
        data: { ...application.toObject(), memberId: member._id },
        from: "application",
      });

      // Log the member creation
      await Log.create({
        action: "created",
        data: member.toObject(),
        from: "member",
      });

      // Remove the approved application from the Application collection
      await Application.deleteOne({ _id: application._id });

      res.status(201).json({
        message:
          "Application approved, member created, and application removed successfully",
        member,
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while approving the application",
        details: error.message,
      });
    }
    io.emit("applicationApproved", member);
  });

module.exports = {
  registerApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
};
