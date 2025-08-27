/**
 * Comment Model Schema
 * 
 * Defines the data structure for user comments on videos in the YouTube Clone application.
 * Includes automatic ID generation and virtual fields for user-friendly display.
 */

import mongoose from 'mongoose';

/**
 * Comment Schema Definition
 * 
 * MongoDB schema for video comments with automatic ID generation,
 * user relationships, and virtual fields for enhanced functionality.
 */
const commentSchema = new mongoose.Schema({
  // Unique identifier for comment tracking and management
  commentId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    required: false // Will be auto-generated if not provided
  },
  
  // Reference to the video this comment belongs to
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video', // Reference to Video model for population
    required: true
  },
  
  // Reference to the user who wrote this comment
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model for population
    required: true
  },
  
  // The actual comment text content
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  
  // Timestamp when comment was posted
  timestamp: {
    type: Date,
    default: Date.now
  }
});

/**
 * Pre-save Middleware: Comment ID Generation
 * 
 * Automatically generates a unique comment ID if one isn't provided.
 * Format: comment_[timestamp]_[randomString] for uniqueness and readability.
 */
commentSchema.pre('save', function(next) {
  if (!this.commentId) {
    // Generate unique ID: comment_[timestamp]_[random9char]
    this.commentId = 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

/**
 * Virtual Field: Comment Age
 * 
 * Calculates and formats the time elapsed since comment was posted.
 * Provides user-friendly time display (e.g., "2 hours ago", "3 days ago").
 */
commentSchema.virtual('age').get(function() {
  const now = new Date();
  const commentDate = new Date(this.timestamp);
  const diffInSeconds = Math.floor((now - commentDate) / 1000);
  
  // Return appropriate time unit based on elapsed time
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
});

/**
 * Schema Configuration for Virtual Fields
 * 
 * Ensures virtual fields (like 'age') are included when converting
 * documents to JSON or plain objects for API responses.
 */
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

// Create and export the Comment model
const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
