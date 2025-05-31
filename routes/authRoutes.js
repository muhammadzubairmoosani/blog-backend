const express = require("express");
const router = express.Router();

// Import controllers
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
} = require("../controllers/authController");

// Import middleware
const { authenticate } = require("../middleware/auth");
const {
  validate,
  registerSchema,
  loginSchema,
} = require("../middleware/validation");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validate(registerSchema), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validate(loginSchema), login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post("/refresh", refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", authenticate, logout);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticate, getProfile);

module.exports = router;
