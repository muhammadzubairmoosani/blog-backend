const express = require("express");
const router = express.Router();

// Import controllers
const {
  getPublishedPosts,
  getMyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  getPostStats,
} = require("../controllers/postController");

// Import middleware
const {
  authenticate,
  authorizeRoles,
  optionalAuth,
} = require("../middleware/auth");
const {
  validate,
  postSchema,
  postStatusSchema,
  validatePostQuery,
} = require("../middleware/validation");

// @route   GET /api/posts
// @desc    Get all published posts (public with optional auth for personalization)
// @access  Public
router.get("/", validatePostQuery, optionalAuth, getPublishedPosts);

// @route   GET /api/posts/my
// @desc    Get current user's posts (draft + published)
// @access  Private (Author/Admin)
router.get("/my", authenticate, validatePostQuery, getMyPosts);

// @route   GET /api/posts/stats
// @desc    Get post statistics
// @access  Private (Admin only)
router.get("/stats", authenticate, authorizeRoles("admin"), getPostStats);

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public (published) / Private (draft - owner/admin only)
router.get("/:id", optionalAuth, getPostById);

// @route   POST /api/posts
// @desc    Create new post
// @access  Private (Author/Admin)
router.post(
  "/",
  authenticate,
  authorizeRoles("author", "admin"),
  validate(postSchema),
  createPost
);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Owner/Admin)
router.put("/:id", authenticate, validate(postSchema), updatePost);

// @route   PATCH /api/posts/:id/status
// @desc    Update post status (publish/unpublish)
// @access  Private (Owner/Admin)
router.patch(
  "/:id/status",
  authenticate,
  validate(postStatusSchema),
  updatePostStatus
);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Owner/Admin)
router.delete("/:id", authenticate, deletePost);

module.exports = router;
