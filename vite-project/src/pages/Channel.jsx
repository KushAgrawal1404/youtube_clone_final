import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import VideoManager from '../components/VideoManager';
import CreateChannel from '../components/CreateChannel';
import EditVideoModal from '../components/EditVideoModal';
import './Channel.css';

const Channel = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showEditVideoDropdown, setShowEditVideoDropdown] = useState(false);
  const [showDeleteVideoDropdown, setShowDeleteVideoDropdown] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const editVideoDropdownRef = useRef(null);
  const deleteVideoDropdownRef = useRef(null);

  const fetchChannel = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/channels/${channelId}`);
      setChannel(response.data.channel);
    } catch (error) {
      setError('Failed to load channel');
      console.error('Error fetching channel:', error);
    }
  }, [channelId]);

  const fetchChannelVideos = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/channel/${channelId}`);
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error fetching channel videos:', error);
    }
  }, [channelId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChannel(), fetchChannelVideos()]);
      setLoading(false);
    };
    loadData();
  }, [fetchChannel, fetchChannelVideos]);

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

  const handleVideoUpdate = (videoId, updatedVideo) => {
    setVideos(prev => prev.map(video => 
      video._id === videoId ? { ...video, ...updatedVideo } : video
    ));
  };

  const handleVideoDelete = (videoId) => {
    setVideos(prev => prev.filter(video => video._id !== videoId));
  };

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

  const handleChannelCreated = (newChannel) => {
    setChannel(newChannel);
    setShowCreateChannel(false);
  };

  const handleChannelUpdated = (updatedChannel) => {
    setChannel(updatedChannel);
    setShowCreateChannel(false);
  };

  const formatSubscribers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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

  const isOwner = user && channel.owner._id === user._id;

  return (
    <div className="channel">
      {/* Channel Header */}
      <div className="channel__header">
        <div className="channel__banner">
          <img 
            src={channel.channelBanner || 'https://picsum.photos/1200/200?random=40'} 
            alt={`${channel.channelName} banner`}
          />
        </div>
        
        <div className="channel__info">
          <div className="channel__avatar">
            <img 
              src={channel.owner?.avatar || 'https://picsum.photos/80/80?random=41'} 
              alt={channel.owner?.username || 'Channel owner'}
            />
          </div>
          
          <div className="channel__details">
            <h1 className="channel__name">{channel.channelName}</h1>
            <p className="channel__description">{channel.description}</p>
            
            <div className="channel__stats">
              <span className="channel__subscribers">
                {formatSubscribers(channel.subscribers)} subscribers
              </span>
              <span className="channel__videos">
                {videos.length} videos
              </span>
              <span className="channel__category">{channel.category}</span>
            </div>

            {isOwner && (
              <div className="channel__owner-actions">
                <button 
                  onClick={() => setShowCreateChannel(true)}
                  className="channel__btn channel__btn--edit"
                >
                  Edit Channel
                </button>
                <Link 
                  to="/upload" 
                  className="channel__btn channel__btn--upload"
                >
                  Upload Video
                </Link>
                <div className="channel__video-actions">
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

      {/* Channel Videos */}
      <div className="channel__content">
        <div className="channel__videos-header">
          <h2>Videos</h2>
          {videos.length === 0 && (
            <p className="channel__no-videos">
              {isOwner ? 'No videos yet. Start by uploading your first video!' : 'This channel has no videos yet.'}
            </p>
          )}
        </div>

        {videos.length > 0 && (
          <div className="channel__videos-grid">
            {videos.map(video => (
              <div key={video._id} className="channel__video-item">
                <VideoCard video={video} />
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
