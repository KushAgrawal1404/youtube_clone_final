/**
 * Channel Page Component
 * 
 * Individual channel display page showing channel information, videos, and management tools.
 * Features owner-specific functionality including video editing, deletion, and channel updates.
 * Provides comprehensive channel overview with banner, avatar, stats, and video grid.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import VideoManager from '../components/VideoManager';
import CreateChannel from '../components/CreateChannel';
import EditVideoModal from '../components/EditVideoModal';
import ProfileIcon from '../components/ProfileIcon';
import './Channel.css';

/**
 * Channel Page Component
 * 
 * Comprehensive channel view page displaying channel metadata, video collection,
 * and owner-specific management tools. Supports video editing, deletion, and
 * channel updates through modal components. Features responsive design with
 * dropdown menus for video management actions.
 */
const Channel = () => {
  // Route parameters and authentication
  const { channelId } = useParams(); // Channel ID from URL
  const { user } = useAuth(); // Current authenticated user
  
  // Channel and videos data state
  const [channel, setChannel] = useState(null); // Channel information
  const [videos, setVideos] = useState([]); // Channel's video collection
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(''); // Error message display
  
  // Modal and dropdown visibility states
  const [showCreateChannel, setShowCreateChannel] = useState(false); // Channel edit modal
  const [showEditVideoDropdown, setShowEditVideoDropdown] = useState(false); // Edit video dropdown
  const [showDeleteVideoDropdown, setShowDeleteVideoDropdown] = useState(false); // Delete video dropdown
  const [showEditVideoModal, setShowEditVideoModal] = useState(false); // Video edit modal
  const [selectedVideo, setSelectedVideo] = useState(null); // Currently selected video for editing
  
  // Refs for click-outside detection on dropdowns
  const editVideoDropdownRef = useRef(null);
  const deleteVideoDropdownRef = useRef(null);

  /**
   * Channel Data Fetcher
   * 
   * Retrieves channel information from the API based on channel ID.
   * Updates channel state and handles errors gracefully.
   */
  const fetchChannel = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/channels/${channelId}`);
      setChannel(response.data.channel);
    } catch (error) {
      setError('Failed to load channel');
      console.error('Error fetching channel:', error);
    }
  }, [channelId]);

  /**
   * Channel Videos Fetcher
   * 
   * Retrieves all videos belonging to the specified channel.
   * Updates videos state for display in the channel page.
   */
  const fetchChannelVideos = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/channel/${channelId}`);
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error fetching channel videos:', error);
    }
  }, [channelId]);

  /**
   * Data Loading Effect
   * 
   * Loads both channel data and videos when component mounts or dependencies change.
   * Uses Promise.all for concurrent API calls to improve performance.
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChannel(), fetchChannelVideos()]);
      setLoading(false);
    };
    loadData();
  }, [fetchChannel, fetchChannelVideos]);

  /**
   * Click Outside Effect
   * 
   * Closes dropdown menus when clicking outside of them.
   * Improves user experience by automatically hiding dropdowns.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editVideoDropdownRef.current && !editVideoDropdownRef.current.contains(event.target)) {
        setShowEditVideoDropdown(false);
      }
      if (deleteVideoDropdownRef.current && !deleteVideoDropdownRef.current.contains(event.target)) {
        setShowDeleteVideoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Video Update Handler
   * 
   * Updates video information in the local state when video is edited.
   * Called by VideoManager component after successful video updates.
   */
  const handleVideoUpdate = (videoId, updatedVideo) => {
    setVideos(prev => prev.map(video => 
      video._id === videoId ? { ...video, ...updatedVideo } : video
    ));
  };

  /**
   * Video Delete Handler
   * 
   * Removes video from local state when video is deleted.
   * Called by VideoManager component after successful video deletion.
   */
  const handleVideoDelete = (videoId) => {
    setVideos(prev => prev.filter(video => video._id !== videoId));
  };

  /**
   * Video Deletion API Handler
   * 
   * Sends API request to delete video and updates local state on success.
   * Includes user confirmation dialog to prevent accidental deletions.
   */
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === 'Video deleted successfully') {
        setVideos(prev => prev.filter(video => video._id !== videoId));
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  /**
   * Channel Creation Success Handler
   * 
   * Updates channel state when new channel is created.
   * Called by CreateChannel component in create mode.
   */
  const handleChannelCreated = (newChannel) => {
    setChannel(newChannel);
    setShowCreateChannel(false);
  };

  /**
   * Channel Update Success Handler
   * 
   * Updates channel state when existing channel is updated.
   * Called by CreateChannel component in edit mode.
   */
  const handleChannelUpdated = (updatedChannel) => {
    setChannel(updatedChannel);
    setShowCreateChannel(false);
  };

  /**
   * Subscriber Count Formatter
   * 
   * Formats subscriber counts into human-readable format (e.g., 1.2K, 1.5M).
   * Provides better readability for large numbers.
   */
  const formatSubscribers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Loading state display
  if (loading) {
    return (
      <div className="channel">
        <div className="channel__loading">
          <div className="loading-spinner"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div className="channel">
        <div className="channel__error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Channel not found state
  if (!channel) {
    return (
      <div className="channel">
        <div className="channel__error">
          <h2>Channel not found</h2>
          <p>The channel you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Check if current user is the channel owner
  const isOwner = user && channel.owner._id === user._id;

  return (
    <div className="channel">
      {/* Channel Header Section */}
      <div className="channel__header">
        {/* Channel banner image */}
        <div className="channel__banner">
          <img 
            src={channel.channelBanner || 'https://picsum.photos/1200/200?random=40'} 
            alt={`${channel.channelName} banner`}
          />
        </div>
        
        {/* Channel information and metadata */}
        <div className="channel__info">
          {/* Channel avatar/profile icon */}
          <div className="channel__avatar">
            <ProfileIcon 
              name={channel.channelName} 
              size={80}
              className="profile-icon--large"
              fillContainer={true}
            />
          </div>
          
          {/* Channel details and statistics */}
          <div className="channel__details">
            <h1 className="channel__name">{channel.channelName}</h1>
            <p className="channel__description">{channel.description}</p>
            
            {/* Channel statistics display */}
            <div className="channel__stats">
              <span className="channel__subscribers">
                {formatSubscribers(channel.subscribers)} subscribers
              </span>
              <span className="channel__videos">
                {videos.length} videos
              </span>
              <span className="channel__category">{channel.category}</span>
            </div>

            {/* Owner-specific action buttons and dropdowns */}
            {isOwner && (
              <div className="channel__owner-actions">
                {/* Edit channel button */}
                <button 
                  onClick={() => setShowCreateChannel(true)}
                  className="channel__btn channel__btn--edit"
                >
                  Edit Channel
                </button>
                {/* Upload video navigation */}
                <Link 
                  to="/upload" 
                  className="channel__btn channel__btn--upload"
                >
                  Upload Video
                </Link>
                
                {/* Video management dropdowns */}
                <div className="channel__video-actions">
                  {/* Edit video dropdown */}
                  <div className="channel__dropdown" ref={editVideoDropdownRef}>
                    <button 
                      className="channel__btn channel__btn--edit-video"
                      onClick={() => setShowEditVideoDropdown(!showEditVideoDropdown)}
                    >
                      Edit Video
                    </button>
                    {showEditVideoDropdown && (
                      <div className="channel__dropdown-menu">
                        {videos.length === 0 ? (
                          <div className="channel__dropdown-empty">No videos to edit</div>
                        ) : (
                          videos.map(video => (
                            <div
                              key={video._id}
                              className="channel__dropdown-item"
                              onClick={() => {
                                setSelectedVideo(video);
                                setShowEditVideoDropdown(false);
                                setShowEditVideoModal(true);
                              }}
                            >
                              {video.title}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete video dropdown */}
                  <div className="channel__dropdown" ref={deleteVideoDropdownRef}>
                    <button 
                      className="channel__btn channel__btn--delete-video"
                      onClick={() => setShowDeleteVideoDropdown(!showDeleteVideoDropdown)}
                    >
                      Delete Video
                    </button>
                    {showDeleteVideoDropdown && (
                      <div className="channel__dropdown-menu">
                        {videos.length === 0 ? (
                          <div className="channel__dropdown-empty">No videos to delete</div>
                        ) : (
                          videos.map(video => (
                            <div
                              key={video._id}
                              className="channel__dropdown-item"
                              onClick={() => {
                                setSelectedVideo(video);
                                setShowDeleteVideoDropdown(false);
                                handleDeleteVideo(video._id);
                              }}
                            >
                              {video.title}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Videos Section */}
      <div className="channel__content">
        {/* Videos header with count and empty state message */}
        <div className="channel__videos-header">
          <h2>Videos</h2>
          {videos.length === 0 && (
            <p className="channel__no-videos">
              {isOwner ? 'No videos yet. Start by uploading your first video!' : 'This channel has no videos yet.'}
            </p>
          )}
        </div>

        {/* Videos grid with management tools for owners */}
        {videos.length > 0 && (
          <div className="channel__videos-grid">
            {videos.map(video => (
              <div key={video._id} className="channel__video-item">
                <VideoCard video={video} />
                {/* Video management tools for channel owners */}
                {isOwner && (
                  <VideoManager 
                    video={video}
                    onVideoUpdate={handleVideoUpdate}
                    onVideoDelete={handleVideoDelete}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Channel Modal */}
      {showCreateChannel && (
        <div className="channel__modal-overlay">
          <div className="channel__modal">
            <CreateChannel 
              editMode={true}
              channelToEdit={channel}
              onChannelCreated={handleChannelCreated}
              onChannelUpdated={handleChannelUpdated}
              onCancel={() => setShowCreateChannel(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditVideoModal && selectedVideo && (
        <div className="channel__modal-overlay">
          <div className="channel__modal">
            <EditVideoModal
              video={selectedVideo}
              onVideoUpdated={(updatedVideo) => {
                handleVideoUpdate(selectedVideo._id, updatedVideo);
                setShowEditVideoModal(false);
                setSelectedVideo(null);
              }}
              onCancel={() => {
                setShowEditVideoModal(false);
                setSelectedVideo(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Channel;
