/**
 * Channels Page Component
 * 
 * Channel management page that displays user's created channels and provides
 * functionality to create new channels. Features modal-based channel creation
 * and navigation to video upload functionality.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ChannelCard from '../components/ChannelCard';
import CreateChannel from '../components/CreateChannel';
import './Channels.css';

/**
 * Channels Page Component
 * 
 * Central hub for channel management allowing users to view, create, and manage
 * their YouTube-style channels. Integrates with CreateChannel modal component
 * and provides seamless navigation to video upload functionality.
 */
const Channels = () => {
  // Authentication context
  const { user } = useAuth(); // Current authenticated user
  
  // Component state management
  const [channels, setChannels] = useState([]); // Array of user's channels
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(''); // Error message display
  const [showCreateChannel, setShowCreateChannel] = useState(false); // Modal visibility state

  /**
   * Channels Fetching Function
   * 
   * Retrieves all channels owned by the current user from the API.
   * Uses useCallback to prevent unnecessary re-renders and API calls.
   * Handles errors gracefully with user feedback.
   * 
   * @returns {Promise<void>}
   */
  const fetchChannels = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/channels/user/${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChannels(response.data.channels);
    } catch (error) {
      setError('Failed to load your channels');
      console.error('Error fetching channels:', error);
    }
  }, [user]);

  /**
   * Initialization Effect
   * 
   * Fetches user channels when component mounts or user changes.
   * Sets loading to false after initial fetch attempt.
   */
  useEffect(() => {
    fetchChannels();
    setLoading(false);
  }, [fetchChannels]);

  /**
   * Channel Creation Success Handler
   * 
   * Adds newly created channel to the channels list and closes the modal.
   * Called when CreateChannel component successfully creates a new channel.
   */
  const handleChannelCreated = (newChannel) => {
    setChannels(prev => [newChannel, ...prev]); // Add new channel to beginning of list
    setShowCreateChannel(false); // Close the creation modal
  };

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="channels">
        <div className="channels__container">
          <div className="channels__empty">
            <h2>Please Sign In</h2>
            <p>You need to be signed in to view your channels.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state display
  if (loading) {
    return (
      <div className="channels">
        <div className="channels__loading">
          <div className="loading-spinner"></div>
          <p>Loading your channels...</p>
        </div>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div className="channels">
        <div className="channels__error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="channels">
      {/* Page header with title, description, and action buttons */}
      <div className="channels__header">
        <div className="channels__container">
          <h1>My Channels</h1>
          <p>View and manage your created channels</p>
          
          {/* Action buttons for authenticated users */}
          {user && (
            <div className="channels__header-actions">
              {/* Create channel button */}
              <button
                onClick={() => setShowCreateChannel(true)}
                className="channels__create-btn"
              >
                Create Channel
              </button>
              {/* Navigate to video upload page */}
              <Link to="/upload" className="channels__upload-btn">
                Upload Video
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main content area with channels display */}
      <div className="channels__content">
        <div className="channels__container">
          {/* Conditional rendering based on channels availability */}
          {channels.length === 0 ? (
            /* Empty state when no channels exist */
            <div className="channels__empty">
              <h2>No channels yet</h2>
              <p>You haven't created any channels yet. Start by creating your first channel!</p>
              {user && (
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="channels__create-btn channels__create-btn--empty"
                >
                  Create First Channel
                </button>
              )}
            </div>
          ) : (
            /* Channels grid when channels are available */
            <>
              <div className="channels__grid">
                {channels.map(channel => (
                  <ChannelCard key={channel._id} channel={channel} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Channel Modal Overlay */}
      {showCreateChannel && (
        <div className="channels__modal-overlay">
          <div className="channels__modal">
            <CreateChannel 
              editMode={false}
              onChannelCreated={handleChannelCreated}
              onCancel={() => setShowCreateChannel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Channels;
