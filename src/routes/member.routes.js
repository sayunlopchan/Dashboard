const express = require("express");
const {
  registerMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require("../controllers/member.controller.js");

const router = express.Router();

// Register a new member
router.post("/register", registerMember);

// Get all members
router.get("/", getMembers);

// Get a specific member by ID
router.get("/:id", getMemberById);

// Update a specific member by ID
router.put("/:id", updateMember);

// Delete a specific member by ID
router.delete("/:id", deleteMember);

module.exports = router;
