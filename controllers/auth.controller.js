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
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Check if user is an admin
    if (!user.admin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token in HTTP cookie (production)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000, // cookie expiration in (1 hour)
    });

    // Set token in HTTP cookie (Development)
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "Lax",
    //   maxAge: 3600000, // 1 hour expiration
    // });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true, // Change to true in production with HTTPS
    sameSite: "lax",
    expires: new Date(0), // Expire immediately
  });
  res.status(200).json({ message: "Logout successful" });
};

// Verify token and admin status
const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token; // Get token from cookie
    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

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

module.exports = { signup, login, verifyToken, logout };
