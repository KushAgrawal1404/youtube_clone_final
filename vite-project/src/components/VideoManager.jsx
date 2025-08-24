import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './VideoManager.css';

const VideoManager = ({ video, onVideoUpdate, onVideoDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: video.title,
    description: video.description,
    category: video.category,
    tags: video.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Technology', 'Music', 
    'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(`http://localhost:5000/api/videos/${video._id}`, {
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(`http://localhost:5000/api/videos/${video._id}`, {
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

  const canManage = user && video.uploader === user._id;

  if (!canManage) {
    return null;
  }

  return (
    <div className="video-manager">
      {!isEditing ? (
        <div className="video-manager__actions">
          <button
            onClick={() => setIsEditing(true)}
            className="video-manager__btn video-manager__btn--edit"
            disabled={loading}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="video-manager__btn video-manager__btn--delete"
            disabled={loading}
          >
            Delete
          </button>
        </div>
      ) : (
        <form onSubmit={handleEdit} className="video-manager__edit-form">
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

          {error && (
            <div className="video-manager__error">
              <p>{error}</p>
            </div>
          )}

          <div className="video-manager__edit-actions">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
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
