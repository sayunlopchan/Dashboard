const express = require("express");
const {
  registerMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  filterMembers,
  searchMembers,
  renewMembership,
  updatePaymentAndRenewal,
} = require("../controllers/member.controller.js");

const router = express.Router();

// Register a new member
router.post("/register", registerMember);

// Get all members
router.get("/", getMembers);

// Filter members
router.get("/filter", filterMembers);

// Search members by memberId, firstName, lastName, or email
router.get("/search", searchMembers);

// Get a specific member by ID
router.get("/:id", getMemberById);

// Update a specific member by ID
router.put("/:id", updateMember);

// Delete a specific member by ID
router.delete("/:id", deleteMember);

// Renew membership for a specific member by memberId
router.post("/renew/:memberId", renewMembership);

// Update payment & process renewal for a specific member by memberId
router.post("/payment/:memberId", updatePaymentAndRenewal);

module.exports = router;
