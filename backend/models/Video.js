/**
 * Video Model Schema
 * 
 * Defines the data structure for video content in the YouTube Clone application.
 * Includes metadata, engagement metrics, and relationships to channels and users.
 */

import mongoose from 'mongoose';

/**
 * Video Schema Definition
 * 
 * MongoDB schema for video content with comprehensive metadata,
 * engagement tracking, and search optimization.
 */
const videoSchema = new mongoose.Schema({
  // Main title of the video for display and search
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  // Detailed description of video content and context
  description: {
    type: String,
    required: [true, 'Video description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // URL to the actual video file (stored in cloud storage or local server)
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  
  // URL to the video thumbnail image for preview display
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  
  // Reference to the channel that published this video
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel', // Reference to Channel model for population
    required: true
  },
  
  // Reference to the user who uploaded the video
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model for population
    required: true
  },
  
  // Total view count for engagement metrics
  views: {
    type: Number,
    default: 0
  },
  
  // Total like count for positive engagement
  likes: {
    type: Number,
    default: 0
  },
  
  // Total dislike count for negative engagement
  dislikes: {
    type: Number,
    default: 0
  },
  
  // Array of user IDs who liked this video
  userLikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Array of user IDs who disliked this video
  userDislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Content category for video classification and discovery
  category: {
    type: String,
    required: [true, 'Video category is required'],
    // Predefined categories matching channel categories for consistency
    enum: [
      'Gaming', 'Education', 'Entertainment', 'Technology', 
      'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 
      'Travel', 'Food', 'Fitness'
    ]
  },
  
  // Timestamp when video was uploaded
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // Video duration in MM:SS format for display
  duration: {
    type: String,
    default: '0:00'
  },
  
  // Array of descriptive tags for search and categorization
  tags: [{
    type: String,
    trim: true
  }]
});

/**
 * Text Index for Search Functionality
 * 
 * Creates a compound text index on title, description, and tags fields
 * to enable efficient full-text search across video content.
 * This improves search performance for user queries.
 */
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Create and export the Video model
const Video = mongoose.model('Video', videoSchema);

export default Video;
