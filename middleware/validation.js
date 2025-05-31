const Joi = require("joi");

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: errorMessage,
      });
    }

    next();
  };
};

// User registration validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),

  role: Joi.string().valid("admin", "author").default("author").messages({
    "any.only": "Role must be either admin or author",
  }),
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Post creation/update validation schema
const postSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),

  content: Joi.string().min(10).required().messages({
    "string.min": "Content must be at least 10 characters long",
    "any.required": "Content is required",
  }),

  status: Joi.string().valid("draft", "published").default("draft").messages({
    "any.only": "Status must be either draft or published",
  }),

  tags: Joi.array()
    .items(Joi.string().min(1).max(30))
    .max(10)
    .default([])
    .messages({
      "array.max": "Cannot have more than 10 tags",
      "string.min": "Each tag must be at least 1 character long",
      "string.max": "Each tag cannot exceed 30 characters",
    }),
});

// Comment validation schema
const commentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required().messages({
    "string.min": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 500 characters",
    "any.required": "Comment content is required",
  }),
});

// Post status update validation schema
const postStatusSchema = Joi.object({
  status: Joi.string().valid("draft", "published").required().messages({
    "any.only": "Status must be either draft or published",
    "any.required": "Status is required",
  }),
});

// Query parameter validation for posts
const validatePostQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().max(100).optional(),
    status: Joi.string().valid("draft", "published").optional(),
    tags: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    sortBy: Joi.string()
      .valid("createdAt", "updatedAt", "title", "views")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      error: error.details[0].message,
    });
  }

  // Convert sortOrder to number for MongoDB
  value.sortOrder = value.sortOrder === "asc" ? 1 : -1;

  // Ensure tags is always an array
  if (value.tags && typeof value.tags === "string") {
    value.tags = [value.tags];
  }

  req.query = value;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  postSchema,
  commentSchema,
  postStatusSchema,
  validatePostQuery,
};
