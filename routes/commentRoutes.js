const express = require("express");
const router = express.Router();

// Import controllers
const {
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

// Import middleware
const { authenticate, optionalAuth } = require("../middleware/auth");
const { validate, commentSchema } = require("../middleware/validation");

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a specific post
// @access  Public (for published posts)
router.get("/:id/comments", optionalAuth, getPostComments);

// @route   POST /api/posts/:id/comments
// @desc    Add comment to a post
// @access  Private (authenticated users)
router.post("/:id/comments", authenticate, validate(commentSchema), addComment);

// @route   PUT /api/comments/:commentId
// @desc    Update comment
// @access  Private (comment author only)
router.put(
  "/comments/:commentId",
  authenticate,
  validate(commentSchema),
  updateComment
);

// @route   DELETE /api/comments/:commentId
// @desc    Delete comment
// @access  Private (comment author or admin)
router.delete("/comments/:commentId", authenticate, deleteComment);

module.exports = router;
