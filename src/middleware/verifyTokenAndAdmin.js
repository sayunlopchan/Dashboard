const jwt = require("jsonwebtoken");
const User = require("../models/Auth.model.js");

const verifyTokenAndAdmin = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded token's ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (!user.admin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyTokenAndAdmin;
