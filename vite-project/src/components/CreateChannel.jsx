import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './CreateChannel.css';

const CreateChannel = ({ onChannelCreated, onChannelUpdated, onCancel, editMode = false, channelToEdit = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    channelName: '',
    description: '',
    category: 'Technology',
    channelBanner: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 
    'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  // Initialize form data when editing
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (editMode) {
        // Update existing channel
        response = await axios.put(`http://localhost:5000/api/channels/${channelToEdit._id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.message === 'Channel updated successfully') {
          onChannelUpdated(response.data.channel);
        }
      } else {
        // Create new channel
        response = await axios.post('http://localhost:5000/api/channels/create', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.message === 'Channel created successfully') {
          onChannelCreated(response.data.channel);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} channel`);
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="create-channel__form">
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

        {error && (
          <div className="create-channel__error">
            <p>{error}</p>
          </div>
        )}

        <div className="create-channel__actions">
          <button
            type="button"
            onClick={onCancel}
            className="create-channel__btn create-channel__btn--cancel"
            disabled={loading}
          >
            Cancel
          </button>
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
