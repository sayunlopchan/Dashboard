const express = require("express");
const {
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

// Filter members
router.get("/filter", filterMembers);

// Search members by memberId, firstName, lastName, or email
router.get("/search", searchMembers);

// Get a specific member by ID
router.get("/:id", getMemberById);

// Get a specific member by memberID
router.get("/memberId/:memberId", getMemberByMemberId);

// Update a specific member by ID
router.put("/:id", updateMember);

// Delete a specific member by ID
router.delete("/:id", deleteMember);

router.put("/renew/:memberId", renewAndPayMembership);

module.exports = router;
