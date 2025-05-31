const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    slug: {
      type: String,
      unique: true,
    },
    readTime: {
      type: Number, // in minutes
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
postSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

// Create compound index for efficient queries
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ author: 1, status: 1 });

// Generate slug before saving
postSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();
  }

  // Calculate read time (average 200 words per minute)
  if (this.isModified("content")) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  next();
});

// Virtual for comments count
postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  count: true,
});

// Ensure virtual fields are serialized
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// Static method to get published posts
postSchema.statics.getPublishedPosts = function (options = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    tags,
    sortBy = "createdAt",
    sortOrder = -1,
  } = options;

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

  return this.find(query)
    .populate("author", "name email")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Instance method to increment views
postSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("Post", postSchema);
