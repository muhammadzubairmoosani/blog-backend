const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", commentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blog API is running successfully!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
