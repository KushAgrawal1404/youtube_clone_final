/**
 * Comment Management Routes
 * 
 * Handles CRUD operations for video comments including creation, retrieval,
 * updates, and deletion with proper authorization checks.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import Video from '../models/Video.js';

const router = express.Router();

/**
 * Input Validation Middleware
 * 
 * Ensures comment text meets length requirements and is properly formatted.
 * Comments must be between 1 and 500 characters for readability and moderation.
 */
const validateComment = [
  body('text')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .trim()
];

/**
 * POST /api/comments - Add New Comment
 * 
 * Creates a new comment on a video with validation and user authentication.
 * Automatically generates unique comment ID and associates with video and user.
 */
router.post('/', auth, validateComment, async (req, res) => {
  try {
    // Validate input data against defined rules
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

    // Verify video exists before allowing comment
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Create new comment instance
    const comment = new Comment({
      videoId,
      userId,
      text
    });

    console.log('Comment object before save:', comment);

    await comment.save();

    console.log('Comment saved successfully:', comment);

    // Populate comment with user information for response
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

/**
 * GET /api/comments/video/:videoId - Get Video Comments
 * 
 * Retrieves all comments for a specific video with pagination support.
 * Results are sorted by timestamp (newest comments first).
 */
router.get('/video/:videoId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Verify video exists before fetching comments
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Execute query with pagination and population
    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate('userId', 'username avatar') // Include user details
      .sort({ timestamp: -1 }) // Newest comments first
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

/**
 * PUT /api/comments/:commentId - Update Comment
 * 
 * Updates an existing comment's text content.
 * Only comment authors can modify their own comments.
 */
router.put('/:commentId', auth, validateComment, async (req, res) => {
  try {
    // Validate input data
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

    // Verify user owns the comment before allowing updates
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Update comment with new text
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { text },
      { new: true, runValidators: true } // Return updated document and run validation
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

/**
 * DELETE /api/comments/:commentId - Delete Comment
 * 
 * Permanently removes a comment from the system.
 * Only comment authors can delete their own comments.
 */
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Verify user owns the comment before allowing deletion
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment document
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ success: true });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

export default router;
