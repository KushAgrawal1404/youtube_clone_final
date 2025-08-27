/**
 * Upload Page Component
 * 
 * Video upload page that allows authenticated users to upload videos to their channels.
 * Provides comprehensive form for video metadata, channel selection, and file URLs.
 * Includes validation, error handling, and automatic channel detection.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Upload.css';

/**
 * Upload Page Component
 * 
 * Comprehensive video upload interface with channel selection and metadata management.
 * Features automatic channel detection, form validation, and user-friendly error handling.
 * Redirects users to video player page after successful upload.
 */
const Upload = () => {
  // Authentication and navigation
  const { user } = useAuth(); // Current authenticated user
  const navigate = useNavigate(); // React Router navigation hook
  
  // Component state management
  const [channels, setChannels] = useState([]); // User's available channels
  const [loading, setLoading] = useState(false); // Loading state during upload
  const [error, setError] = useState(''); // Error message display
  
  // Form data state with default values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    channelId: '',
    category: 'Technology',
    tags: ''
  });

  /**
   * Available Video Categories
   * 
   * Predefined list of video categories for consistent classification.
   * Matches categories used in other components for platform consistency.
   */
  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 
    'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  /**
   * Channel Fetching Effect
   * 
   * Automatically fetches user's channels when component mounts.
   * Auto-selects the first available channel for convenience.
   */
  useEffect(() => {
    if (user) {
      fetchUserChannels();
    }
  }, [user]);

  /**
   * User Channels Fetcher
   * 
   * Retrieves all channels owned by the current user from the API.
   * Automatically selects the first channel if available for better UX.
   * Handles errors gracefully with user feedback.
   */
  const fetchUserChannels = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/channels/user/${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChannels(response.data.channels);
      
      // Auto-select first channel if available and no channel is currently selected
      if (response.data.channels.length > 0 && !formData.channelId) {
        setFormData(prev => ({ ...prev, channelId: response.data.channels[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError('Failed to load your channels');
    }
  };

  /**
   * Form Input Change Handler
   * 
   * Updates form state when input values change.
   * Uses the input's name attribute to dynamically update the correct field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Form Submission Handler
   * 
   * Processes video upload form submission with comprehensive validation.
   * Converts tags from comma-separated string to array format.
   * Sends video data to API and redirects to video player on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate channel selection before submission
    if (!formData.channelId) {
      setError('Please select a channel');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert tags string to array format for API
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Prepare video data with processed tags
      const videoData = {
        ...formData,
        tags: tagsArray
      };

      // Send video upload request to API
      const response = await axios.post('http://localhost:5000/api/videos', videoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video uploaded successfully') {
        // Redirect to the uploaded video player page
        navigate(`/video/${response.data.video._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload video');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="upload">
        <div className="upload__container">
          <div className="upload__error">
            <h2>Please Sign In</h2>
            <p>You need to be signed in to upload videos.</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return if user has no channels
  if (channels.length === 0) {
    return (
      <div className="upload">
        <div className="upload__container">
          <div className="upload__error">
            <h2>No Channels Available</h2>
            <p>You need to create a channel before you can upload videos.</p>
            <button 
              onClick={() => navigate('/channels')}
              className="upload__btn upload__btn--primary"
            >
              Create Channel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload">
      <div className="upload__container">
        {/* Page header with title and description */}
        <div className="upload__header">
          <h1>Upload Video</h1>
          <p>Share your content with the world</p>
        </div>

        {/* Video upload form */}
        <form onSubmit={handleSubmit} className="upload__form">
          {/* Video title input field */}
          <div className="upload__field">
            <label htmlFor="title">Video Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="Enter video title"
            />
          </div>

          {/* Video description textarea */}
          <div className="upload__field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={1000}
              rows={4}
              placeholder="Describe your video"
            />
          </div>

          {/* Channel selection dropdown */}
          <div className="upload__field">
            <label htmlFor="channelId">Channel *</label>
            <select
              id="channelId"
              name="channelId"
              value={formData.channelId}
              onChange={handleChange}
              required
            >
              <option value="">Select a channel</option>
              {channels.map(channel => (
                <option key={channel._id} value={channel._id}>
                  {channel.channelName}
                </option>
              ))}
            </select>
          </div>

          {/* Video category selection */}
          <div className="upload__field">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
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

          {/* Video URL input with help text */}
          <div className="upload__field">
            <label htmlFor="videoUrl">Video URL *</label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              required
              placeholder="https://example.com/video.mp4"
            />
            <small>Provide a direct link to your video file</small>
          </div>

          {/* Thumbnail URL input with help text */}
          <div className="upload__field">
            <label htmlFor="thumbnailUrl">Thumbnail URL *</label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              required
              placeholder="https://example.com/thumbnail.jpg"
            />
            <small>Provide a link to your video thumbnail image</small>
          </div>

          {/* Optional tags input with help text */}
          <div className="upload__field">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="gaming, tutorial, fun"
            />
            <small>Separate tags with commas</small>
          </div>

          {/* Error message display */}
          {error && (
            <div className="upload__error">
              <p>{error}</p>
            </div>
          )}

          {/* Form action buttons */}
          <div className="upload__actions">
            {/* Cancel button - navigates back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="upload__btn upload__btn--cancel"
              disabled={loading}
            >
              Cancel
            </button>
            {/* Submit button with loading state */}
            <button
              type="submit"
              className="upload__btn upload__btn--submit"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
