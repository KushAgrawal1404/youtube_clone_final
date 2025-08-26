import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    unique: true,
    sparse: true,
    required: false
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Generate unique comment ID before saving
commentSchema.pre('save', function(next) {
  if (!this.commentId) {
    this.commentId = 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

// Virtual for comment age
commentSchema.virtual('age').get(function() {
  const now = new Date();
  const commentDate = new Date(this.timestamp);
  const diffInSeconds = Math.floor((now - commentDate) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
