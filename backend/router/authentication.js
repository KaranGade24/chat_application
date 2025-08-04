const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  register,
  login,
  logout,
  getCurrentUser,
  sendOtpToMail,
  verifyOtp,
} = require("../controller/authentication");
const { authenticate } = require("../authentication/authentication");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", authenticate, getCurrentUser);
router.post("/get-otp", sendOtpToMail);
router.post("/verify-otp", verifyOtp);

module.exports = router;
