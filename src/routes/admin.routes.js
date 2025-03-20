const express = require("express");
const router = express.Router();
const verifyTokenAndAdmin = require("../middleware/verifyTokenAndAdmin");

// Apply middleware to the /admin route
router.get("/admin", verifyTokenAndAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome to the admin panel" });
});

module.exports = router;
