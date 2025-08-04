const User = require("../model/User");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
// In-memory store: email -> { otp, expiresAt }
const otpStore = new Map();
// inside sendOtpToMail
const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

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
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create and send otp to mail
exports.sendOtpToMail = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Sending email to:", email);
    // Create a transporter

    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt });
    console.log("Your OTP is stored in memory :", otp, otpStore);
    //  Create mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ChatFlow OTP Verification",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background: #f4f4f4;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #4c8bf5; margin-bottom: 0;">ChatFlow</h2>
        <p style="font-size: 18px; color: #333;">Verify your email to continue</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <p style="font-size: 16px; color: #333;">Hi there 👋,</p>
        <p style="font-size: 16px; color: #333;">Here is your OTP to verify your email with <strong>ChatFlow</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #4c8bf5; color: white; font-size: 24px; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #777;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email.</p>
        <p style="font-size: 14px; color: #333;">Thanks,<br/>The ChatFlow Team</p>
      </div>
      <div style="text-align: center; font-size: 12px; color: #aaa; padding-top: 20px;">
        <p>© ${new Date().getFullYear()} ChatFlow. All rights reserved.</p>
      </div>
    </div>
  `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  } catch (err) {
    console.error("Error sending email:", err);
    res.send("Error sending email");
  }
};

//virify otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Verifying OTP for email:", email, otp);
    // Check if OTP exists for the given email
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ message: "No OTP found or expired." });
    }

    // Check if expired
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email); // Remove expired OTP
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    // Compare OTP
    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Success: OTP is valid
    otpStore.delete(email); // Optional: remove after successful verification
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Error verifying OTP." });
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
