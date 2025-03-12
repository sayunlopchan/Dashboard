const User = require("../models/User.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { signupSchema, loginSchema } = require("../validators/auth.validator.js");

// Signup
const signup = async (req, res) => {
  try {
    // Validate the request body against the signup schema
    const { error } = signupSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { username, email, password } = req.body;

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log(newUser);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Login
const login = async (req, res) => {
  try {
    // Validate the request body against the login schema
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // Compare the plain text password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate a JWT for the authenticated user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login };
