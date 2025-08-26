import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  channelName: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    maxlength: [50, 'Channel name cannot exceed 50 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Channel description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  channelBanner: {
    type: String,
    default: 'https://example.com/banners/default_banner.png'
  },
  subscribers: {
    type: Number,
    default: 0
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  category: {
    type: String,
    required: [true, 'Channel category is required'],
    enum: ['Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
