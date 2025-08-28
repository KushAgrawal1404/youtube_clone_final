/**
 * VideoManager Component
 * 
 * Component for managing video metadata including editing and deletion.
 * Only visible to video owners and provides inline editing capabilities.
 * Supports title, description, category, and tags management.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config.js';
import './VideoManager.css';

/**
 * VideoManager Component
 * 
 * Provides video management functionality for video owners including inline editing
 * and deletion. Features permission-based access control and comprehensive form
 * validation. Supports editing video metadata without leaving the current page.
 */
const VideoManager = ({ video, onVideoUpdate, onVideoDelete }) => {
  // Authentication context to get current user
  const { user } = useAuth();
  
  // Local state management
  const [isEditing, setIsEditing] = useState(false); // Controls edit mode
  const [editData, setEditData] = useState({
    title: video.title,
    description: video.description,
    category: video.category,
    tags: video.tags?.join(', ') || '' // Convert tags array to comma-separated string
  });
  
  // UI state management
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error message display

  /**
   * Available Video Categories
   * 
   * Predefined list of video categories for consistent classification.
   * Matches the categories used in other components for consistency.
   */
  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 
    'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  /**
   * Form Input Change Handler
   * 
   * Updates form state when input values change.
   * Uses the input's name attribute to dynamically update the correct field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Video Edit Handler
   * 
   * Sends API request to update video metadata and handles response.
   * Processes tags from comma-separated string back to array format.
   * Updates parent component state and exits edit mode on success.
   */
  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send PUT request with processed data (tags converted back to array)
      const response = await axios.put(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.BASE}/${video._id}`, {
        ...editData,
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video updated successfully') {
        onVideoUpdate(video._id, response.data.video);
        setIsEditing(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Video Delete Handler
   * 
   * Confirms deletion with user and sends API request to delete video.
   * Includes confirmation dialog to prevent accidental deletions.
   * Updates parent component state on successful deletion.
   */
  const handleDelete = async () => {
    // Require user confirmation before deletion
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.BASE}/${video._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video deleted successfully') {
        onVideoDelete(video._id);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  // Permission check: only video owners can manage their videos
  const canManage = user && video.uploader === user._id;

  // Early return if user doesn't have permission to manage this video
  if (!canManage) {
    return null;
  }

  return (
    <div className="video-manager">
      {/* Conditional rendering: action buttons or edit form */}
      {!isEditing ? (
        /* Action buttons for video management */
        <div className="video-manager__actions">
          {/* Edit button - switches to edit mode */}
          <button
            onClick={() => setIsEditing(true)}
            className="video-manager__btn video-manager__btn--edit"
            disabled={loading}
          >
            Edit
          </button>
          {/* Delete button - removes video after confirmation */}
          <button
            onClick={handleDelete}
            className="video-manager__btn video-manager__btn--delete"
            disabled={loading}
          >
            Delete
          </button>
        </div>
      ) : (
        /* Inline edit form for video metadata */
        <form onSubmit={handleEdit} className="video-manager__edit-form">
          {/* Video title input field */}
          <div className="video-manager__field">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={editData.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          {/* Video description textarea */}
          <div className="video-manager__field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={editData.description}
              onChange={handleChange}
              required
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Video category selection */}
          <div className="video-manager__field">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={editData.category}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Video tags input (comma-separated) */}
          <div className="video-manager__field">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={editData.tags}
              onChange={handleChange}
              placeholder="react, javascript, tutorial"
            />
          </div>

          {/* Error message display */}
          {error && (
            <div className="video-manager__error">
              <p>{error}</p>
            </div>
          )}

          {/* Edit form action buttons */}
          <div className="video-manager__edit-actions">
            {/* Cancel button - exits edit mode and resets form */}
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form data to original video values
                setEditData({
                  title: video.title,
                  description: video.description,
                  category: video.category,
                  tags: video.tags?.join(', ') || ''
                });
              }}
              className="video-manager__btn video-manager__btn--cancel"
              disabled={loading}
            >
              Cancel
            </button>
            {/* Save button - submits form with loading state */}
            <button
              type="submit"
              className="video-manager__btn video-manager__btn--save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VideoManager;
