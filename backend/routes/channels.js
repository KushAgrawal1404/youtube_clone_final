/**
 * Channel Management Routes
 * 
 * Handles CRUD operations for YouTube-style channels including creation,
 * retrieval, updates, and deletion with proper authorization checks.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Channel from '../models/Channel.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Input Validation Middleware
 * 
 * Validates channel data to ensure data integrity and proper formatting
 * for channel creation and updates.
 */
const validateChannel = [
  body('channelName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Channel name must be between 1 and 50 characters')
    .trim(),
  body('description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters')
    .trim(),
  body('category')
    .isIn(['Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'])
    .withMessage('Invalid category')
];

/**
 * POST /api/channels/create - Create New Channel
 * 
 * Creates a new channel for the authenticated user with validation.
 * Prevents duplicate channel names for the same user.
 */
router.post('/create', auth, validateChannel, async (req, res) => {
  try {
    // Validate input data against defined rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { channelName, description, category, channelBanner } = req.body;
    const owner = req.user._id;

    // Check if user already has a channel with this name
    const existingChannel = await Channel.findOne({ 
      owner, 
      channelName 
    });

    if (existingChannel) {
      return res.status(400).json({ 
        message: 'You already have a channel with this name' 
      });
    }

    // Create new channel instance
    const channel = new Channel({
      channelName,
      owner,
      description,
      category,
      channelBanner: channelBanner || undefined
    });

    await channel.save();

    // Update user's channels array to include new channel
    await User.findByIdAndUpdate(
      owner,
      { $push: { channels: channel._id } }
    );

    res.status(201).json({
      message: 'Channel created successfully',
      channel
    });

  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Server error creating channel' });
  }
});

/**
 * GET /api/channels - Get All Channels
 * 
 * Retrieves all channels with populated owner and video information.
 * Results are sorted by creation date (newest first).
 */
router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate('owner', 'username avatar') // Include owner details
      .populate('videos') // Include video information
      .sort({ createdAt: -1 }); // Newest channels first

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error fetching channels' });
  }
});

/**
 * GET /api/channels/:id - Get Channel by ID
 * 
 * Retrieves a specific channel by its unique identifier.
 * Populates owner and video information for complete channel data.
 */
router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('owner', 'username avatar') // Include owner details
      .populate({
        path: 'videos', // Populate video information
        populate: {
          path: 'uploader', // Also populate video uploader details
          select: 'username avatar'
        }
      });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: 'Server error fetching channel' });
  }
});

/**
 * GET /api/channels/user/:userId - Get User's Channels
 * 
 * Retrieves all channels owned by a specific user.
 * Useful for displaying user's channel portfolio.
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const channels = await Channel.find({ owner: req.params.userId })
      .populate('owner', 'username avatar')
      .populate('videos')
      .sort({ createdAt: -1 }); // Newest channels first

    res.json({ channels });
  } catch (error) {
    console.error('Get user channels error:', error);
    res.status(500).json({ message: 'Server error fetching user channels' });
  }
});

/**
 * PUT /api/channels/:id - Update Channel
 * 
 * Updates an existing channel's information.
 * Only channel owners can modify their channels.
 */
router.put('/:id', auth, validateChannel, async (req, res) => {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user owns the channel before allowing updates
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this channel' });
    }

    const { channelName, description, category, channelBanner } = req.body;

    // Check for name conflicts with user's other channels (excluding current channel)
    if (channelName !== channel.channelName) {
      const existingChannel = await Channel.findOne({ 
        owner: req.user._id, 
        channelName,
        _id: { $ne: req.params.id } // Exclude current channel from check
      });

      if (existingChannel) {
        return res.status(400).json({ 
          message: 'You already have a channel with this name' 
        });
      }
    }

    // Update channel with new data
    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      {
        channelName,
        description,
        category,
        channelBanner: channelBanner || channel.channelBanner // Keep existing if not provided
      },
      { new: true, runValidators: true } // Return updated document and run validation
    ).populate('owner', 'username avatar');

    res.json({
      message: 'Channel updated successfully',
      channel: updatedChannel
    });

  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ message: 'Server error updating channel' });
  }
});

/**
 * DELETE /api/channels/:id - Delete Channel
 * 
 * Permanently removes a channel and its associated data.
 * Only channel owners can delete their channels.
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user owns the channel before allowing deletion
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this channel' });
    }

    // Remove channel reference from user's channels array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { channels: req.params.id } }
    );

    // Delete the channel document
    await Channel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Channel deleted successfully' });

  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Server error deleting channel' });
  }
});

export default router;
