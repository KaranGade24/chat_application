const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  register,
  login,
  logout,
  getCurrentUser,
} = require("../controller/authentication");
const { authenticate } = require("../authentication/authentication");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", authenticate, getCurrentUser);
module.exports = router;
