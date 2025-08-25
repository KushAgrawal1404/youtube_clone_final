import React, { useState } from 'react';
import axios from 'axios';
import './EditVideoModal.css';

const EditVideoModal = ({ video, onVideoUpdated, onCancel }) => {
  const [editData, setEditData] = useState({
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(`http://localhost:5000/api/videos/${video._id}`, editData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video updated successfully') {
        onVideoUpdated(response.data.video);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-video-modal">
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

      <form onSubmit={handleSubmit} className="edit-video-modal__form">
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
          {editData.thumbnailUrl && (
            <div className="edit-video-modal__thumbnail-preview">
              <img 
                src={editData.thumbnailUrl} 
                alt="Thumbnail preview" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="edit-video-modal__thumbnail-error" style={{display: 'none'}}>
                Invalid thumbnail URL
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="edit-video-modal__error">
            <p>{error}</p>
          </div>
        )}

        <div className="edit-video-modal__actions">
          <button
            type="button"
            onClick={onCancel}
            className="edit-video-modal__btn edit-video-modal__btn--cancel"
            disabled={loading}
          >
            Cancel
          </button>
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
