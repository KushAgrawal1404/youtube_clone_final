/**
 * Channel Model Schema
 * 
 * Defines the data structure for YouTube-style channels in the application.
 * Each channel belongs to a user and can contain multiple videos.
 * 
 * @author: Student Developer
 * @version: 1.0.0
 * @date: 2024
 */

import mongoose from 'mongoose';

/**
 * Channel Schema Definition
 * 
 * MongoDB schema for content creator channels with validation rules,
 * owner relationships, and video collections.
 */
const channelSchema = new mongoose.Schema({
  // Display name for the channel (e.g., "Tech Reviews", "Gaming Central")
  channelName: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    maxlength: [50, 'Channel name cannot exceed 50 characters']
  },
  
  // Reference to the user who owns this channel
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model for population
    required: true
  },
  
  // Detailed description of the channel's content and purpose
  description: {
    type: String,
    required: [true, 'Channel description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Banner image URL for channel header display
  channelBanner: {
    type: String,
    default: 'https://example.com/banners/default_banner.png'
  },
  
  // Count of users subscribed to this channel
  subscribers: {
    type: Number,
    default: 0
  },
  
  // Array of video IDs published by this channel
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video' // Reference to Video model for population
  }],
  
  // Content category for channel classification and discovery
  category: {
    type: String,
    required: [true, 'Channel category is required'],
    // Predefined categories for consistent content organization
    enum: [
      'Gaming', 'Education', 'Entertainment', 'Technology', 
      'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 
      'Travel', 'Food', 'Fitness'
    ]
  },
  
  // Timestamp when channel was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Channel model
const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
