const express = require("express");
const {
  signup,
  login,
  verifyToken,
  logout,
} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-token", verifyToken);

module.exports = router;
