import express from "express";
import {
  registerApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
  filterApplications,
  bulkApproveApplications,
  bulkRegisterApplications,
} = require("../controllers/application.controller.js");

const router = express.Router();

// Single application routes
router.post("/register", registerApplication);
router.get("/", getApplications);

// Filter applications (must come before /:id)
router.get("/filter", filterApplications);

// Get, update, delete, approve application by ID (must come after /filter)
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.put("/:id/approve", approveApplication);

// Bulk Registration Route
router.post("/bulk-register", bulkRegisterApplications);
// Bulk Approval Route
router.post("/bulk-approve", bulkApproveApplications);

module.exports = router;
