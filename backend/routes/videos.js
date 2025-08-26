import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, optionalAuth } from '../middleware/auth.js';
import Video from '../models/Video.js';
import Channel from '../models/Channel.js';

const router = express.Router();

// Validation middleware
const validateVideo = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters')
    .trim(),
  body('videoUrl')
    .notEmpty()
    .withMessage('Video URL is required'),
  body('thumbnailUrl')
    .notEmpty()
    .withMessage('Thumbnail URL is required'),
  body('category')
    .isIn(['Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'])
    .withMessage('Invalid category')
];

// Validation middleware for updates (only validates editable fields)
const validateVideoUpdate = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters')
    .trim()
];

// Create a new video
router.post('/', auth, validateVideo, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, videoUrl, thumbnailUrl, channelId, category, tags } = req.body;
    const uploader = req.user._id;

    // Check if channel exists and user owns it
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.owner.toString() !== uploader.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this channel' });
    }

    // Generate realistic video duration
    const generateDuration = () => {
      // Generate duration between 2:30 and 15:45 (realistic YouTube video lengths)
      const minutes = Math.floor(Math.random() * 14) + 2; // 2-15 minutes
      const seconds = Math.floor(Math.random() * 60); // 0-59 seconds
      
      // Ensure positive values
      const safeMinutes = Math.abs(minutes);
      const safeSeconds = Math.abs(seconds);
      
      // Format as MM:SS
      const formattedMinutes = safeMinutes.toString().padStart(2, '0');
      const formattedSeconds = safeSeconds.toString().padStart(2, '0');
      
      return `${formattedMinutes}:${formattedSeconds}`;
    };

    // Create new video
    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      channelId,
      uploader,
      category,
      duration: generateDuration(),
      tags: tags || []
    });

    await video.save();

    // Add video to channel's videos array
    await Channel.findByIdAndUpdate(
      channelId,
      { $push: { videos: video._id } }
    );

    // Populate video with channel and uploader info
    await video.populate([
      { path: 'channelId', select: 'channelName' },
      { path: 'uploader', select: 'username avatar' }
    ]);

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });

  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: 'Server error uploading video' });
  }
});

// Get all videos with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const videos = await Video.find(query)
      .populate('channelId', 'channelName')
      .populate('uploader', 'username avatar')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

// Get video by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('channelId', 'channelName description')
      .populate('uploader', 'username avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Add user like/dislike status if authenticated
    let userStatus = { liked: false, disliked: false };
    if (req.user) {
      userStatus.liked = video.userLikes.includes(req.user._id);
      userStatus.disliked = video.userDislikes.includes(req.user._id);
      console.log('User status for video:', req.params.id, 'User:', req.user._id, 'Status:', userStatus);
    } else {
      console.log('No user authenticated for video:', req.params.id);
    }

    const videoResponse = video.toObject();
    videoResponse.userStatus = userStatus;

    res.json(videoResponse);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error fetching video' });
  }
});

// Increment video views (separate endpoint to prevent duplicate increments)
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only increment views if user is authenticated
    if (req.user) {
      video.views += 1;
      await video.save();
    }

    res.json({ success: true, views: video.views });
  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({ message: 'Server error incrementing views' });
  }
});

// Get videos by channel
router.get('/channel/:channelId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ channelId: req.params.channelId })
      .populate('channelId', 'channelName')
      .populate('uploader', 'username avatar')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments({ channelId: req.params.channelId });

    res.json({
      videos,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get channel videos error:', error);
    res.status(500).json({ message: 'Server error fetching channel videos' });
  }
});

// Update video
router.put('/:id', auth, validateVideoUpdate, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user owns the video
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    const { title, description, category, tags } = req.body;

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        tags: tags || []
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'channelId', select: 'channelName' },
      { path: 'uploader', select: 'username avatar' }
    ]);

    res.json({
      message: 'Video updated successfully',
      video: updatedVideo
    });

  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error updating video' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user owns the video
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Remove video from channel's videos array
    await Channel.findByIdAndUpdate(
      video.channelId,
      { $pull: { videos: req.params.id } }
    );

    // Delete the video
    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error deleting video' });
  }
});

// Like video with toggle functionality
router.post('/:id/like', auth, async (req, res) => {
  try {
    console.log('Like request received:', req.params.id, req.body, req.user._id);
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { action } = req.body;
    const userId = req.user._id;

    // Check if user has already liked this video
    const userLikeIndex = video.userLikes.indexOf(userId);
    const userDislikeIndex = video.userDislikes.indexOf(userId);

    if (action === 'remove') {
      // Remove like if exists
      if (userLikeIndex > -1) {
        video.userLikes.splice(userLikeIndex, 1);
        video.likes = Math.max(0, video.likes - 1);
      }
    } else {
      // Add like
      if (userLikeIndex === -1) {
        video.userLikes.push(userId);
        video.likes += 1;
      }
      
      // Remove dislike if exists
      if (userDislikeIndex > -1) {
        video.userDislikes.splice(userDislikeIndex, 1);
        video.dislikes = Math.max(0, video.dislikes - 1);
      }
    }

    await video.save();

    res.json({
      success: true,
      likes: video.likes,
      dislikes: video.dislikes
    });

  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ message: 'Server error processing like' });
  }
});

// Dislike video with toggle functionality
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    console.log('Dislike request received:', req.params.id, req.body, req.user._id);
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { action } = req.body;
    const userId = req.user._id;

    // Check if user has already disliked this video
    const userDislikeIndex = video.userDislikes.indexOf(userId);
    const userLikeIndex = video.userLikes.indexOf(userId);

    if (action === 'remove') {
      // Remove dislike if exists
      if (userDislikeIndex > -1) {
        video.userDislikes.splice(userDislikeIndex, 1);
        video.dislikes = Math.max(0, video.dislikes - 1);
      }
    } else {
      // Add dislike
      if (userDislikeIndex === -1) {
        video.userDislikes.push(userId);
        video.dislikes += 1;
      }
      
      // Remove like if exists
      if (userLikeIndex > -1) {
        video.userLikes.splice(userLikeIndex, 1);
        video.likes = Math.max(0, video.likes - 1);
      }
    }

    await video.save();

    res.json({
      success: true,
      likes: video.likes,
      dislikes: video.dislikes
    });

  } catch (error) {
    console.error('Dislike video error:', error);
    res.status(500).json({ message: 'Server error processing dislike' });
  }
});

// Get videos by user (for channel management)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user is requesting their own videos or is admin
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these videos' });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ uploader: req.params.userId })
      .populate('channelId', 'channelName')
      .populate('uploader', 'username avatar')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments({ uploader: req.params.userId });

    res.json({
      videos,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ message: 'Server error fetching user videos' });
  }
});

export default router;
