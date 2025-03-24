// routes/admin.routes.js
const express = require("express");
const path = require("path");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Protected admin dashboard route
router.get("/dashboard", adminAuth, (req, res) => {
  // Adjust the path as needed based on your folder structure
  res.sendFile(path.join(__dirname, "../../client/admin/pages/dashboard.html"));
});

module.exports = router;
