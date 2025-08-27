/**
 * Comment Component
 * 
 * Displays individual comments with user information, timestamp, and content.
 * Supports editing and deleting comments for authenticated users who own the comment.
 * Includes real-time timestamp formatting and profile icons.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileIcon from './ProfileIcon';
import axios from 'axios';
import './Comment.css';

/**
 * Comment Component
 * 
 * Individual comment display component with edit/delete functionality for comment owners.
 * Manages local state for editing mode and handles API calls for comment updates.
 */
const Comment = ({ comment, onCommentUpdate, onCommentDelete }) => {
  // Authentication context to check user permissions
  const { isAuthenticated, user } = useAuth();

  // Local state management for editing functionality
  const [isEditing, setIsEditing] = useState(false); // Controls edit mode
  const [editText, setEditText] = useState(comment.text); // Current edit input value
  const [currentText, setCurrentText] = useState(comment.text); // Displayed comment text

  /**
   * Timestamp Formatter
   * 
   * Converts comment timestamp to relative time format (e.g., "2 minutes ago").
   * Provides user-friendly time representation for recent comments.
   */
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    // Return appropriate time unit based on difference
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  /**
   * Comment Edit Handler
   * 
   * Sends API request to update comment text and updates local state.
   * Only allows editing if the new text is not empty.
   */
  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      // Send PUT request to update comment
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

  /**
   * Comment Delete Handler
   * 
   * Sends API request to delete comment and notifies parent component.
   * Handles error cases gracefully.
   */
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
      {/* Comment header with user info and actions */}
      <div className="comment__header">
        {/* User avatar/profile icon */}
        <div className="comment__avatar">
          <ProfileIcon
            name={comment.userId?.username || 'Unknown User'}
            size={32}
            className="profile-icon--small"
            fillContainer={true}
          />
        </div>

        {/* User information and timestamp */}
        <div className="comment__info">
          <span className="comment__author">
            {comment.userId?.username || 'Unknown User'}
          </span>
          <span className="comment__date">
            {formatTimestamp(comment.timestamp)}
          </span>
        </div>

        {/* Edit/Delete actions for comment owners */}
        {isAuthenticated && comment.userId?._id === user?._id && (
          <div className="comment__actions">
            {/* Edit button - opens edit form */}
            <button
              onClick={() => {
                setIsEditing(true);
                setEditText(currentText);
              }}
              className="comment__edit"
            >
              Edit
            </button>
            {/* Delete button - removes comment */}
            <button
              onClick={handleDelete}
              className="comment__delete"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Conditional rendering: edit form or comment text */}
      {isEditing ? (
        /* Edit form with textarea and action buttons */
        <div className="comment__edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="comment__input"
            rows="3"
          />
          <div className="comment__edit-actions">
            {/* Save button - submits edit */}
            <button
              onClick={handleEdit}
              className="comment__btn"
            >
              Save
            </button>
            {/* Cancel button - closes edit form without saving */}
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
        /* Display comment text when not editing */
        <p className="comment__text">{currentText}</p>
      )}
    </div>
  );
};

export default Comment;
