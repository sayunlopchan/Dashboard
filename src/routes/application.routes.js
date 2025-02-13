const express = require("express");
const {
  registerApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  approveApplication,
} = require("../controllers/application.controller.js");

const router = express.Router();

// Set up routes and pass `io` as an argument to the controller functions
router.post("/", (req, res) => registerApplication(io)(req, res));
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.put("/:id", (req, res) => updateApplication(io)(req, res));
router.delete("/:id", (req, res) => deleteApplication(io)(req, res));
router.post("/:id/approve", (req, res) => approveApplication(io)(req, res));

module.exports = router;
