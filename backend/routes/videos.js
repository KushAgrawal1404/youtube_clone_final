/**
 * Video Management Routes
 * 
 * Handles CRUD operations for video content including upload, retrieval,
 * updates, deletion, and engagement features like likes/dislikes.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, optionalAuth } from '../middleware/auth.js';
import Video from '../models/Video.js';
import Channel from '../models/Channel.js';

const router = express.Router();

/**
 * Input Validation Middleware
 * 
 * Ensures data integrity for video creation and updates.
 * Separate validation for creation vs updates to allow partial edits.
 */

// Validation rules for new video creation
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

// Validation rules for video updates (only editable fields)
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

/**
 * POST /api/videos - Upload New Video
 * 
 * Creates a new video entry with validation and channel ownership verification.
 * Automatically generates realistic video duration and updates channel relationships.
 */
router.post('/', auth, validateVideo, async (req, res) => {
  try {
    // Validate input data against defined rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, videoUrl, thumbnailUrl, channelId, category, tags } = req.body;
    const uploader = req.user._id;

    // Verify channel exists and user owns it
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.owner.toString() !== uploader.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this channel' });
    }

    /**
     * Generate Realistic Video Duration
     * 
     * Creates random duration between 2:30 and 15:45 minutes
     * to simulate realistic YouTube video lengths.
     */
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

    // Create new video instance
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

    // Update channel's videos array to include new video
    await Channel.findByIdAndUpdate(
      channelId,
      { $push: { videos: video._id } }
    );

    // Populate video with related data for response
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

/**
 * GET /api/videos - Get All Videos with Filtering
 * 
 * Retrieves videos with optional category filtering, search functionality,
 * and pagination support. Uses optional authentication for personalized content.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply category filter if specified
    if (category && category !== 'All') {
      query.category = category;
    }

    // Apply text search using MongoDB text index
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination and population
    const videos = await Video.find(query)
      .populate('channelId', 'channelName')
      .populate('uploader', 'username avatar')
      .sort({ uploadDate: -1 }) // Newest videos first
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

/**
 * GET /api/videos/:id - Get Video by ID
 * 
 * Retrieves a specific video with full details and user engagement status.
 * Includes channel and uploader information for complete video context.
 */
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

/**
 * POST /api/videos/:id/view - Increment Video Views
 * 
 * Increments view count for a video. Only counts views from authenticated users
 * to prevent artificial inflation from anonymous users.
 */
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only increment views for authenticated users to prevent abuse
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

/**
 * GET /api/videos/channel/:channelId - Get Videos by Channel
 * 
 * Retrieves all videos from a specific channel with pagination support.
 * Useful for channel pages and video browsing.
 */
router.get('/channel/:channelId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ channelId: req.params.channelId })
      .populate('channelId', 'channelName')
      .populate('uploader', 'username avatar')
      .sort({ uploadDate: -1 }) // Newest videos first
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

/**
 * PUT /api/videos/:id - Update Video
 * 
 * Updates video metadata (title, description, category, tags).
 * Only video owners can modify their content.
 * 
 */
router.put('/:id', auth, validateVideoUpdate, async (req, res) => {
  try {
    // Validate input data
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

    // Verify user owns the video before allowing updates
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    const { title, description, category, tags } = req.body;

    // Update video with new data
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        tags: tags || []
      },
      { new: true, runValidators: true } // Return updated document and run validation
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

/**
 * DELETE /api/videos/:id - Delete Video
 * 
 * Permanently removes a video and updates channel relationships.
 * Only video owners can delete their content.
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Verify user owns the video before allowing deletion
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Remove video reference from channel's videos array
    await Channel.findByIdAndUpdate(
      video.channelId,
      { $pull: { videos: req.params.id } }
    );

    // Delete the video document
    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error deleting video' });
  }
});

/**
 * POST /api/videos/:id/like - Toggle Video Like
 * 
 * Handles video likes with toggle functionality. Users can like/unlike videos,
 * and likes automatically remove any existing dislikes.
 */
router.post('/:id/like', auth, async (req, res) => {
  try {
    console.log('Like request received:', req.params.id, req.body, req.user._id);
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { action } = req.body;
    const userId = req.user._id;

    // Check current user engagement status
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
      
      // Remove dislike if exists (likes override dislikes)
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

/**
 * POST /api/videos/:id/dislike - Toggle Video Dislike
 * 
 * Handles video dislikes with toggle functionality. Users can dislike/undislike videos,
 * and dislikes automatically remove any existing likes.
 */
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    console.log('Dislike request received:', req.params.id, req.body, req.user._id);
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { action } = req.body;
    const userId = req.user._id;

    // Check current user engagement status
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
      
      // Remove like if exists (dislikes override likes)
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

/**
 * GET /api/videos/user/:userId - Get User's Videos
 * 
 * Retrieves all videos uploaded by a specific user.
 * Restricted to user's own videos for privacy and security.
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Ensure users can only access their own videos
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these videos' });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ uploader: req.params.userId })
      .populate('channelId', 'channelName')
      .populate('uploader', 'username avatar')
      .sort({ uploadDate: -1 }) // Newest videos first
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
