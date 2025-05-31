const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Get comments for a specific post
const getPostComments = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Only show comments for published posts (unless user is author/admin)
    if (
      post.status !== "published" &&
      (!req.user ||
        (req.user.id !== post.author.toString() && req.user.role !== "admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: "Comments not available for this post",
      });
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    const comments = await Comment.find({ post: postId })
      .populate("author", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({ post: postId });
    const totalPages = Math.ceil(totalComments / limit);

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add comment to a post
const addComment = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;

    // Check if post exists and is published
    const post = await Post.findOne({ _id: postId, status: "published" });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or not published",
      });
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
    });

    await comment.populate("author", "name email");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// Update comment (only by comment author)
const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own comments.",
      });
    }

    comment.content = content;
    await comment.save();
    await comment.populate("author", "name email");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment (by comment author or admin)
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author or admin
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own comments.",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
};
