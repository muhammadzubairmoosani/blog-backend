const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register new user
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "author",
    });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Find user with this refresh token
      const user = await User.findOne({
        _id: decoded.id,
        refreshToken,
      }).select("+refreshToken");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Generate new access token
      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
};
