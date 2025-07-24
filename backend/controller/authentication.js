const User = require("../model/User");
const jwt = require("jsonwebtoken");

// Cookie + JWT
const sendToken = (user, res, statusCode) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ Required for HTTPS
      sameSite: "none", // ✅ Required for cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log("Token set in cookie:", token);

    const { password, ...rest } = user._doc;
    let userData = { ...rest, token, _id: user._id }; // Include token in user data
    // Log the user data for debugging
    console.log("User data sent in response:", userData);

    res.status(statusCode).json({
      success: true,
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Error generating token:", err);
    res.status(500).json({ message: "Error generating token" });
  }
};

// @register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    console.log("Registering user:", { name, email });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use." });

    const user = await User.create({ name, email, password });
    sendToken(user, res, 201);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    sendToken(user, res, 200);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error in logging" });
  }
};

// @logout
exports.logout = (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error logging out" });
  }
};

// @getCurrentUser
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Log the user data for debugging
    console.log("Current user data:", user);
    // Return the user data without password
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: err.message });
  }
};
