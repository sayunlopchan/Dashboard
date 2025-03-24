const User = require("../models/User.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  signupSchema,
  loginSchema,
} = require("../validators/auth.validator.js");

// Signup
const signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log(newUser);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login with admin check
const login = async (req, res) => {
  try {
    // Validate the request body against the login schema
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare the plain text password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Check if user is an admin
    if (!user.admin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Generate a JWT for the authenticated user
    const token = jwt.sign(
      { id: user._id, admin: user.admin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Verify token and admin status
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.admin) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

module.exports = { signup, login, verifyToken };
