import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Channel from '../models/Channel.js';
import User from '../models/User.js';

const router = express.Router();

// Validation middleware
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

// Create a new channel
router.post('/create', auth, validateChannel, async (req, res) => {
  try {
    // Check for validation errors
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

    // Create new channel
    const channel = new Channel({
      channelName,
      owner,
      description,
      category,
      channelBanner: channelBanner || undefined
    });

    await channel.save();

    // Add channel to user's channels array
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

// Get all channels
router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate('owner', 'username avatar')
      .populate('videos')
      .sort({ createdAt: -1 });

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error fetching channels' });
  }
});

// Get channel by ID
router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate({
        path: 'videos',
        populate: {
          path: 'uploader',
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

// Get user's channels
router.get('/user/:userId', async (req, res) => {
  try {
    const channels = await Channel.find({ owner: req.params.userId })
      .populate('owner', 'username avatar')
      .populate('videos')
      .sort({ createdAt: -1 });

    res.json({ channels });
  } catch (error) {
    console.error('Get user channels error:', error);
    res.status(500).json({ message: 'Server error fetching user channels' });
  }
});

// Update channel
router.put('/:id', auth, validateChannel, async (req, res) => {
  try {
    // Check for validation errors
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

    // Check if user owns the channel
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this channel' });
    }

    const { channelName, description, category, channelBanner } = req.body;

    // Check if name is already taken by user's other channels
    if (channelName !== channel.channelName) {
      const existingChannel = await Channel.findOne({ 
        owner: req.user._id, 
        channelName,
        _id: { $ne: req.params.id }
      });

      if (existingChannel) {
        return res.status(400).json({ 
          message: 'You already have a channel with this name' 
        });
      }
    }

    // Update channel
    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      {
        channelName,
        description,
        category,
        channelBanner: channelBanner || channel.channelBanner
      },
      { new: true, runValidators: true }
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

// Delete channel
router.delete('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user owns the channel
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this channel' });
    }

    // Remove channel from user's channels array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { channels: req.params.id } }
    );

    // Delete the channel
    await Channel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Channel deleted successfully' });

  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Server error deleting channel' });
  }
});

export default router;
