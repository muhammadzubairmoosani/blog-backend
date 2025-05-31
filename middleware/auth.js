const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select(
        "-password -refreshToken"
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is valid but user not found",
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password -refreshToken"
      );

      if (user) {
        req.user = user;
      }
    } catch (jwtError) {
      // Ignore JWT errors for optional auth
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    next(); // Continue even if there's an error
  }
};

module.exports = {
  authenticate,
  authorizeRoles,
  optionalAuth,
};
