const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post reference is required"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

// Update editedAt when comment is modified
commentSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Static method to get comments for a post
commentSchema.statics.getPostComments = function (postId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = -1,
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find({ post: postId })
    .populate("author", "name email")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to count comments for a post
commentSchema.statics.countPostComments = function (postId) {
  return this.countDocuments({ post: postId });
};

module.exports = mongoose.model("Comment", commentSchema);
