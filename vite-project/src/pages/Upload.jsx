import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    channelId: '',
    category: 'Technology',
    tags: ''
  });

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 
    'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  // Fetch user's channels on component mount
  useEffect(() => {
    if (user) {
      fetchUserChannels();
    }
  }, [user]);

  const fetchUserChannels = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/channels/user/${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChannels(response.data.channels);
      
      // Auto-select first channel if available
      if (response.data.channels.length > 0 && !formData.channelId) {
        setFormData(prev => ({ ...prev, channelId: response.data.channels[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError('Failed to load your channels');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.channelId) {
      setError('Please select a channel');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const videoData = {
        ...formData,
        tags: tagsArray
      };

      const response = await axios.post('http://localhost:5000/api/videos', videoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video uploaded successfully') {
        // Redirect to the uploaded video
        navigate(`/video/${response.data.video._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload video');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="upload__header">
          <h1>Upload Video</h1>
          <p>Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="upload__form">
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

          {error && (
            <div className="upload__error">
              <p>{error}</p>
            </div>
          )}

          <div className="upload__actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="upload__btn upload__btn--cancel"
              disabled={loading}
            >
              Cancel
            </button>
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
