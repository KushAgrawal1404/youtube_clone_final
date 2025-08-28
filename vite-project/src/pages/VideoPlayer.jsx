/**
 * VideoPlayer Page Component
 * 
 * Main video playback page featuring video player, metadata display, like/dislike system,
 * and comments functionality. Handles view tracking, user interactions, and real-time
 * comment management for authenticated users.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Comment from '../components/Comment.jsx';
import ProfileIcon from '../components/ProfileIcon';
import axios from 'axios';
import config from '../config.js';
import './VideoPlayer.css';

/**
 * VideoPlayer Page Component
 * 
 * Comprehensive video viewing experience with integrated social features.
 * Includes video playback controls, like/dislike functionality, view tracking,
 * and full comment system with real-time updates. Provides responsive design
 * and user authentication-based feature access.
 */
const VideoPlayer = () => {
  // Route parameters and authentication
  const { videoId } = useParams(); // Video ID from URL
  const { isAuthenticated } = useAuth(); // User authentication status
  
  // Video and comments data state
  const [video, setVideo] = useState(null); // Current video data
  const [comments, setComments] = useState([]); // Video comments array
  const [newComment, setNewComment] = useState(''); // New comment input value
  
  // UI and interaction state
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [liked, setLiked] = useState(false); // User's like status
  const [disliked, setDisliked] = useState(false); // User's dislike status
  const [viewIncremented, setViewIncremented] = useState(false); // View count tracking

  /**
   * Video Data Fetcher
   * 
   * Retrieves video information from the API and sets initial like/dislike state.
   * Updates loading state and handles errors gracefully.
   */
  const fetchVideo = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.BASE}/${videoId}`);
      setVideo(response.data);
      
      // Set initial like/dislike state from backend user status
      if (response.data.userStatus) {
        setLiked(response.data.userStatus.liked);
        setDisliked(response.data.userStatus.disliked);
      }
      
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  /**
   * View Count Incrementer
   * 
   * Increments video view count once per authenticated user session.
   * Updates local video state to reflect the new view count immediately.
   * Prevents duplicate view counting on page refreshes.
   */
  const incrementView = async () => {
    if (!isAuthenticated || viewIncremented) return;
    
    try {
      await axios.post(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.VIEW(videoId)}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setViewIncremented(true);
      
      // Update local view count for immediate UI feedback
      setVideo(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
    } catch (error) {
      console.error('Failed to increment view:', error);
    }
  };

  /**
   * Comments Fetcher
   * 
   * Retrieves all comments for the current video from the API.
   * Handles different response formats gracefully.
   */
  const fetchComments = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}${config.API_ENDPOINTS.COMMENTS.VIDEO(videoId)}`);
      setComments(response.data.comments || response.data);
    } catch {
      console.error('Failed to load comments');
    }
  };

  /**
   * Initialization Effect
   * 
   * Loads video data and comments when component mounts.
   * Scrolls to top of page and increments view count for authenticated users.
   * Manages view counting to prevent duplicate increments.
   */
  useEffect(() => {
    // Scroll to top when video player loads
    window.scrollTo(0, 0);
    fetchVideo();
    fetchComments();
    
    // Increment view count once when video loads for authenticated users
    if (isAuthenticated && !viewIncremented) {
      incrementView();
    }
  }, [isAuthenticated, viewIncremented]);

  /**
   * Like Action Handler
   * 
   * Toggles like status for the video and updates backend accordingly.
   * Handles like removal and switches from dislike to like.
   * Updates local video state with new like/dislike counts.
   */
  const handleLike = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      // Determine action: remove like if already liked, otherwise add like
      const action = liked ? 'remove' : 'like';
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.LIKE(videoId)}`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update video with new like/dislike counts from backend
        setVideo(prev => ({
          ...prev,
          likes: response.data.likes,
          dislikes: response.data.dislikes
        }));
        
        // Update local like/dislike state based on action
        if (action === 'remove') {
          setLiked(false);
        } else {
          setLiked(true);
          setDisliked(false); // Remove dislike when adding like
        }
      }
    } catch (err) {
      console.error('Failed to like video:', err);
    }
  };

  /**
   * Dislike Action Handler
   * 
   * Toggles dislike status for the video and updates backend accordingly.
   * Handles dislike removal and switches from like to dislike.
   * Updates local video state with new like/dislike counts.
   */
  const handleDislike = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      // Determine action: remove dislike if already disliked, otherwise add dislike
      const action = disliked ? 'remove' : 'dislike';
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.DISLIKE(videoId)}`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update video with new like/dislike counts from backend
        setVideo(prev => ({
          ...prev,
          likes: response.data.likes,
          dislikes: response.data.dislikes
        }));
        
        // Update local like/dislike state based on action
        if (action === 'remove') {
          setDisliked(false);
        } else {
          setDisliked(true);
          setLiked(false); // Remove like when adding dislike
        }
      }
    } catch (err) {
      console.error('Failed to dislike video:', err);
    }
  };

  /**
   * Comment Submission Handler
   * 
   * Posts new comment to the video and updates local comments state.
   * Requires user authentication and non-empty comment text.
   * Adds new comment to beginning of comments list for immediate display.
   */
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const response = await axios.post(`${config.API_BASE_URL}${config.API_ENDPOINTS.COMMENTS.BASE}`, {
        videoId,
        text: newComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        // Add new comment to beginning of comments list
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment(''); // Clear comment input
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  /**
   * Comment Update Handler
   * 
   * Updates comment text in local state when comment is edited.
   * Called by Comment component after successful comment updates.
   */
  const handleCommentUpdate = (commentId, newText) => {
    setComments(prev => {
      const updated = prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, text: newText }
          : comment
      );
      return updated;
    });
  };

  /**
   * Comment Delete Handler
   * 
   * Removes comment from local state when comment is deleted.
   * Called by Comment component after successful comment deletion.
   */
  const handleCommentDelete = (commentId) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };

  // Loading state display
  if (loading) {
    return (
      <div className="video-player">
        <div className="video-player__loading">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }



  // Video not found state
  if (!video) {
    return (
      <div className="video-player">
        <div className="video-player__error">
          <h2>Video not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player">
      <div className="video-player__wrapper">
        <div className="video-player__container">
        {/* Video Player Section */}
        <div className="video-player__video">
          <video 
            controls 
            width="100%" 
            height="auto"
            poster={video.thumbnailUrl}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Information Section */}
        <div className="video-player__info">
          {/* Video title */}
          <h1 className="video-player__title">{video.title}</h1>
          
          {/* Video statistics and action buttons */}
          <div className="video-player__stats">
            {/* View count display */}
            <div className="video-player__views">
              {video.views?.toLocaleString()} views
            </div>
            {/* Like/dislike action buttons */}
            <div className="video-player__actions">
              {/* Like button with authentication check */}
              <button 
                className={`video-player__btn ${liked ? 'video-player__btn--liked' : ''}`}
                onClick={handleLike}
                disabled={!isAuthenticated}
                title={!isAuthenticated ? 'Sign in to like videos' : ''}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                </svg>
                {video.likes || 0}
              </button>
              
              {/* Dislike button with authentication check */}
              <button 
                className={`video-player__btn ${disliked ? 'video-player__btn--disliked' : ''}`}
                onClick={handleDislike}
                disabled={!isAuthenticated}
                title={!isAuthenticated ? 'Sign in to dislike videos' : ''}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z"/>
                </svg>
                {video.dislikes || 0}
              </button>
            </div>
          </div>

          {/* Channel information display */}
          <div className="video-player__channel">
            {/* Channel avatar */}
            <div className="video-player__channel-avatar">
              <ProfileIcon 
                name={video.channelId?.channelName || 'Unknown Channel'} 
                size={48}
                className="profile-icon--large"
                fillContainer={true}
              />
            </div>
            {/* Channel details */}
            <div className="video-player__channel-info">
              <h3>{video.channelId?.channelName || 'Unknown Channel'}</h3>
              <p>{video.description}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="video-player__comments">
          {/* Comments header with count */}
          <h3>{comments.length} Comments</h3>
          
          {/* Comment form for authenticated users */}
          {isAuthenticated && (
            <form className="video-player__comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="video-player__comment-input"
                rows="3"
              />
              <button type="submit" className="video-player__comment-btn">
                Comment
              </button>
            </form>
          )}

          {/* Comments list display */}
          <div className="video-player__comments-list">
            {comments.map(comment => (
              <Comment
                key={comment._id}
                comment={comment}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
