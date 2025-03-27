// routes/admin.routes.js
const express = require("express");
const path = require("path");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

// Protected admin dashboard route
router.get("/dashboard", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../admin/pages/dashboard.html"));
});

module.exports = router;
