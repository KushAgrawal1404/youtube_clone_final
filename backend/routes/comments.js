import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import Video from '../models/Video.js';

const router = express.Router();

// Validation middleware
const validateComment = [
  body('text')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .trim()
];

// Add a new comment
router.post('/', auth, validateComment, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { videoId, text } = req.body;
    const userId = req.user._id;

    console.log('Creating comment with data:', { videoId, text, userId });

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Create new comment
    const comment = new Comment({
      videoId,
      userId,
      text
    });

    console.log('Comment object before save:', comment);

    await comment.save();

    console.log('Comment saved successfully:', comment);

    // Populate comment with user info
    await comment.populate('userId', 'username avatar');

    res.status(201).json({
      success: true,
      comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// Get comments for a video
router.get('/video/:videoId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if video exists
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate('userId', 'username avatar')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ videoId: req.params.videoId });

    res.json({
      comments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
});

// Update a comment
router.put('/:commentId', auth, validateComment, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { text } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { text },
      { new: true, runValidators: true }
    ).populate('userId', 'username avatar');

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error updating comment' });
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ success: true });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

export default router;
