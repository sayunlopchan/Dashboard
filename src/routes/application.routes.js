const express = require("express");
const {
  registerApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
  filterApplications,
} = require("../controllers/application.controller.js");

const router = express.Router();

// Routes
router.post("/register", registerApplication);
router.get("/", getApplications);

// Filter applications (must come before /:id)
router.get("/filter", filterApplications);

// Get application by ID (must come after /filter)
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.put("/:id/approve", approveApplication);

module.exports = router;