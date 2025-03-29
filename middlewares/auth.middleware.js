// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

// Middleware to authenticate using the token stored in HTTP cookies
const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).redirect("/admin/unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).redirect("/admin/unauthorized");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).redirect("/admin/unauthorized");
  }
};

// Middleware to check admin status
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    return res.status(403).redirect("/admin/unauthorized");
  }
};

module.exports = { authenticate, checkAdmin };
