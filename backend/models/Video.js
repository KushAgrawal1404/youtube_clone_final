import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Video description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  userLikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  userDislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    required: [true, 'Video category is required'],
    enum: ['Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: String,
    default: '0:00'
  },
  tags: [{
    type: String,
    trim: true
  }]
});

// Index for search functionality
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);

export default Video;
