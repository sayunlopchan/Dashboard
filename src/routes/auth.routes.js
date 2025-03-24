const express = require("express");
const {
  signup,
  login,
  verifyToken,
} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-token", verifyToken);

module.exports = router;
