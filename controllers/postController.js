const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Get all published posts (public)
const getPublishedPosts = async (req, res, next) => {
  try {
    const { page, limit, search, tags, sortBy, sortOrder } = req.query;

    let query = { status: "published" };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add tag filtering
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    // Get posts with pagination
    const posts = await Post.find(query)
      .populate("author", "name email")
      .populate("commentsCount")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's own posts (author's posts)
const getMyPosts = async (req, res, next) => {
  try {
    const { page, limit, search, status, sortBy, sortOrder } = req.query;

    let query = { author: req.user.id };

    // Add status filtering
    if (status) {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    const posts = await Post.find(query)
      .populate("author", "name email")
      .populate("commentsCount")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single post by ID
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query = { _id: id };

    // If user is not authenticated or not the author/admin, only show published posts
    if (
      !req.user ||
      (req.user.role !== "admin" &&
        req.user.id !== req.post?.author?.toString())
    ) {
      query.status = "published";
    }

    const post = await Post.findOne(query)
      .populate("author", "name email")
      .populate("commentsCount");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment views if it's a published post
    if (post.status === "published") {
      await post.incrementViews();
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Create new post
const createPost = async (req, res, next) => {
  try {
    const { title, content, status, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      status: status || "draft",
      tags: tags || [],
    });

    await post.populate("author", "name email");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Update post
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, status, tags } = req.body;

    let post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own posts.",
      });
    }

    // Update fields
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (status !== undefined) post.status = status;
    if (tags !== undefined) post.tags = tags;

    await post.save();
    await post.populate("author", "name email");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Delete post
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own posts.",
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: id });

    // Delete post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Post and associated comments deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update post status (publish/unpublish)
const updatePostStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own posts.",
      });
    }

    post.status = status;
    await post.save();
    await post.populate("author", "name email");

    res.status(200).json({
      success: true,
      message: `Post ${status} successfully`,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Get post statistics (admin only)
const getPostStats = async (req, res, next) => {
  try {
    const stats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          draftPosts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    // Get top authors
    const topAuthors = await Post.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$author",
          postCount: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          name: "$author.name",
          email: "$author.email",
          postCount: 1,
          totalViews: 1,
        },
      },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
      },
      topAuthors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedPosts,
  getMyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  getPostStats,
};
