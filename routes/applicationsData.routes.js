const express = require("express");
const router = express.Router();
const {
  getApplicationsData,
} = require("../controllers/applicationsData.controller");

// Route to fetch the applications data
router.get("/", getApplicationsData);

module.exports = router;
