import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ChannelCard from '../components/ChannelCard';
import CreateChannel from '../components/CreateChannel';
import './Channels.css';

const Channels = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);

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

  useEffect(() => {
    fetchChannels();
    setLoading(false);
  }, [fetchChannels]);

  const handleChannelCreated = (newChannel) => {
    setChannels(prev => [newChannel, ...prev]);
    setShowCreateChannel(false);
  };

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
      <div className="channels__header">
        <div className="channels__container">
          <h1>My Channels</h1>
          <p>View and manage your created channels</p>
          
          {user && (
            <div className="channels__header-actions">
              <button
                onClick={() => setShowCreateChannel(true)}
                className="channels__create-btn"
              >
                Create Channel
              </button>
              <Link to="/upload" className="channels__upload-btn">
                Upload Video
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="channels__content">
        <div className="channels__container">
          {channels.length === 0 ? (
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

      {/* Create Channel Modal */}
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
