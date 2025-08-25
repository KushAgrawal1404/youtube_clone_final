import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileIcon from './ProfileIcon';
import axios from 'axios';
import './Comment.css';

const Comment = ({ comment, onCommentUpdate, onCommentDelete }) => {
  const { isAuthenticated, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [currentText, setCurrentText] = useState(comment.text);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/comments/${comment._id}`, {
        text: editText
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      console.log('Edit response:', response.data);

      if (response.data.message === 'Comment updated successfully') {
        // Update the comment in the parent component
        onCommentUpdate(comment._id, editText);
        // Update the local text state immediately
        setCurrentText(editText);
        // Close the edit form
        setIsEditing(false);
        console.log('Comment updated successfully, form closed');
      } else {
        console.log('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/comments/${comment._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        onCommentDelete(comment._id);
      }
    } catch {
      console.error('Failed to delete comment');
    }
  };

  return (
    <div className="comment">
      <div className="comment__header">
        <div className="comment__avatar">
          <ProfileIcon
            name={comment.userId?.username || 'Unknown User'}
            size={32}
            className="profile-icon--small"
            fillContainer={true}
          />
        </div>
        <div className="comment__info">
          <span className="comment__author">
            {comment.userId?.username || 'Unknown User'}
          </span>
          <span className="comment__date">
            {formatTimestamp(comment.timestamp)}
          </span>
        </div>
        {isAuthenticated && comment.userId?._id === user?._id && (
          <div className="comment__actions">
            <button
              onClick={() => {
                setIsEditing(true);
                setEditText(currentText);
              }}
              className="comment__edit"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="comment__delete"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="comment__edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="comment__input"
            rows="3"
          />
          <div className="comment__edit-actions">
            <button 
              onClick={handleEdit}
              className="comment__btn"
            >
              Save
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditText(currentText);
              }}
              className="comment__cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="comment__text">{currentText}</p>
      )}
    </div>
  );
};

export default Comment;
