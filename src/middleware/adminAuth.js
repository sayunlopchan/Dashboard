// middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.admin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    // Optionally, attach the user object to the request for later use
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = adminAuth;
