/**
 * CreateChannel Component
 * 
 * Form component for creating new channels or editing existing ones.
 * Supports both creation and edit modes with form validation and API integration.
 * Includes channel name, description, category, and optional banner URL fields.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../config.js';
import './CreateChannel.css';

/**
 * CreateChannel Component
 * 
 * Dual-purpose component that can either create a new channel or edit an existing one.
 * Manages form state, validation, and API calls for channel operations.
 * Provides user feedback for loading states and error handling.
 */
const CreateChannel = ({ onChannelCreated, onChannelUpdated, onCancel, editMode = false, channelToEdit = null }) => {
  // Authentication context to get current user
  const { user } = useAuth();

  // Form data state with default values
  const [formData, setFormData] = useState({
    channelName: '',
    description: '',
    category: 'Technology',
    channelBanner: ''
  });

  // UI state management
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error message display

  /**
   * Available Channel Categories
   * 
   * Predefined list of channel categories for users to choose from.
   * Provides consistent categorization across the platform.
   */
  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Technology', 'Music',
    'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  /**
   * Form Initialization Effect
   * 
   * Populates form fields with existing channel data when in edit mode.
   * Runs whenever editMode or channelToEdit changes.
   */
  useEffect(() => {
    if (editMode && channelToEdit) {
      setFormData({
        channelName: channelToEdit.channelName || '',
        description: channelToEdit.description || '',
        category: channelToEdit.category || 'Technology',
        channelBanner: channelToEdit.channelBanner || ''
      });
    }
  }, [editMode, channelToEdit]);

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
   * Processes form submission for both create and edit modes.
   * Sends API requests and handles success/error responses.
   * Updates parent component state on successful operations.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      if (editMode) {
        // Update existing channel via PUT request
        response = await axios.put(`${config.API_BASE_URL}${config.API_ENDPOINTS.CHANNELS.BASE}/${channelToEdit._id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.message === 'Channel updated successfully') {
          onChannelUpdated(response.data.channel);
        }
      } else {
        // Create new channel via POST request
        response = await axios.post(`${config.API_BASE_URL}${config.API_ENDPOINTS.CHANNELS.CREATE}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.message === 'Channel created successfully') {
          onChannelCreated(response.data.channel);
        }
      }
    } catch (error) {
      // Display error message from API response or fallback message
      setError(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} channel`);
    } finally {
      setLoading(false);
    }
  };

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="create-channel">
        <div className="create-channel__error">
          <p>Please sign in to {editMode ? 'edit' : 'create'} a channel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-channel">
      {/* Form header with title and close button */}
      <div className="create-channel__header">
        <h2>{editMode ? 'Edit Channel' : 'Create New Channel'}</h2>
        <button
          onClick={onCancel}
          className="create-channel__close"
          type="button"
        >
          ×
        </button>
      </div>

      {/* Channel creation/editing form */}
      <form onSubmit={handleSubmit} className="create-channel__form">
        {/* Channel name input field */}
        <div className="create-channel__field">
          <label htmlFor="channelName">Channel Name *</label>
          <input
            type="text"
            id="channelName"
            name="channelName"
            value={formData.channelName}
            onChange={handleChange}
            required
            maxLength={50}
            placeholder="Enter channel name"
          />
        </div>

        {/* Channel description textarea */}
        <div className="create-channel__field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={500}
            rows={4}
            placeholder="Describe your channel"
          />
        </div>

        {/* Channel category selection */}
        <div className="create-channel__field">
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

        {/* Optional banner URL input */}
        <div className="create-channel__field">
          <label htmlFor="channelBanner">Banner URL (Optional)</label>
          <input
            type="url"
            id="channelBanner"
            name="channelBanner"
            value={formData.channelBanner}
            onChange={handleChange}
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        {/* Error message display */}
        {error && (
          <div className="create-channel__error">
            <p>{error}</p>
          </div>
        )}

        {/* Form action buttons */}
        <div className="create-channel__actions">
          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            className="create-channel__btn create-channel__btn--cancel"
            disabled={loading}
          >
            Cancel
          </button>
          {/* Submit button with dynamic text based on mode and loading state */}
          <button
            type="submit"
            className="create-channel__btn create-channel__btn--submit"
            disabled={loading}
          >
            {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Channel' : 'Create Channel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChannel;
