/**
 * EditVideoModal Component
 * 
 * Modal component for editing video metadata including title, description, and thumbnail.
 * Provides form validation, API integration, and thumbnail preview functionality.
 * Supports real-time thumbnail URL validation and error handling.
 */

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config.js';
import './EditVideoModal.css';

/**
 * EditVideoModal Component
 * 
 * Modal dialog that allows users to edit video information such as title,
 * description, and thumbnail URL. Includes form validation, loading states,
 * and thumbnail preview with error handling.
 */
const EditVideoModal = ({ video, onVideoUpdated, onCancel }) => {
  // Form data state initialized with current video values
  const [editData, setEditData] = useState({
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl || ''
  });

  // UI state management
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error message display

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
   * Form Submission Handler
   * 
   * Sends API request to update video metadata and handles response.
   * Updates parent component state on successful update.
   * Provides error handling and loading state management.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send PUT request to update video
      const response = await axios.put(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.BASE}/${video._id}`, editData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video updated successfully') {
        onVideoUpdated(response.data.video);
      }
    } catch (error) {
      // Display error message from API response or fallback message
      setError(error.response?.data?.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-video-modal">
      {/* Modal header with title and close button */}
      <div className="edit-video-modal__header">
        <h2>Edit Video</h2>
        <button
          onClick={onCancel}
          className="edit-video-modal__close"
          type="button"
        >
          ×
        </button>
      </div>

      {/* Video editing form */}
      <form onSubmit={handleSubmit} className="edit-video-modal__form">
        {/* Video title input field */}
        <div className="edit-video-modal__field">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={editData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Enter video title"
          />
        </div>

        {/* Video description textarea */}
        <div className="edit-video-modal__field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={editData.description}
            onChange={handleChange}
            required
            maxLength={1000}
            rows={4}
            placeholder="Describe your video"
          />
        </div>

        {/* Thumbnail URL input with preview */}
        <div className="edit-video-modal__field">
          <label htmlFor="thumbnail">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnail"
            name="thumbnailUrl"
            value={editData.thumbnailUrl}
            onChange={handleChange}
            placeholder="https://example.com/thumbnail.jpg"
          />
          {/* Thumbnail preview section - only shown when URL is provided */}
          {editData.thumbnailUrl && (
            <div className="edit-video-modal__thumbnail-preview">
              {/* Thumbnail image with error handling */}
              <img
                src={editData.thumbnailUrl}
                alt="Thumbnail preview"
                onError={(e) => {
                  // Hide broken image and show error message
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Error message for invalid thumbnail URLs */}
              <div className="edit-video-modal__thumbnail-error" style={{ display: 'none' }}>
                Invalid thumbnail URL
              </div>
            </div>
          )}
        </div>

        {/* Error message display */}
        {error && (
          <div className="edit-video-modal__error">
            <p>{error}</p>
          </div>
        )}

        {/* Form action buttons */}
        <div className="edit-video-modal__actions">
          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            className="edit-video-modal__btn edit-video-modal__btn--cancel"
            disabled={loading}
          >
            Cancel
          </button>
          {/* Save button with loading state */}
          <button
            type="submit"
            className="edit-video-modal__btn edit-video-modal__btn--save"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVideoModal;
