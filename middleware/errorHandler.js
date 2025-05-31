const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: 404,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    let message = "Duplicate field value entered";

    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    if (field === "email") {
      message = "Email already exists";
    } else if (field === "slug") {
      message = "Post with similar title already exists";
    }

    error = {
      message,
      statusCode: 400,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      message: "Invalid token",
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      message: "Token expired",
      statusCode: 401,
    };
  }

  // MongoDB connection errors
  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError"
  ) {
    error = {
      message: "Database connection error",
      statusCode: 500,
    };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

module.exports = errorHandler;
