import express from "express";
import {
  registerMember,
  getMembers,
  getMemberById,
  getMemberByMemberId,
  updateMember,
  deleteMember,
  filterMembers,
  searchMembers,
  renewAndPayMembership,
} = require("../controllers/member.controller.js");

const router = express.Router();

// Register a new member
router.post("/register", registerMember);

// Get all members
router.get("/", getMembers);

// Get a specific member by ID
router.get("/:id", getMemberById);

// Get a specific member by memberID
router.get("/memberId/:memberId", getMemberByMemberId);

// Update a specific member by ID
router.put("/:id", updateMember);

// Delete a specific member by ID
router.delete("/:id", deleteMember);

export default router;
