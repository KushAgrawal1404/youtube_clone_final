import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Comment from '../components/Comment.jsx';
import axios from 'axios';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const { isAuthenticated } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const fetchVideo = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
      setVideo(response.data);
      
      // Set initial like/dislike state from backend
      if (response.data.userStatus) {
        setLiked(response.data.userStatus.liked);
        setDisliked(response.data.userStatus.disliked);
      }
      
      setLoading(false);
    } catch {
      setError('Failed to load video');
      setLoading(false);
    }
  }, [videoId]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/video/${videoId}`);
      setComments(response.data.comments || response.data);
    } catch {
      console.error('Failed to load comments');
    }
  }, [videoId]);

  useEffect(() => {
    // Scroll to top when video player loads
    window.scrollTo(0, 0);
    fetchVideo();
    fetchComments();
  }, [fetchVideo, fetchComments]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      // If already liked, remove like. If disliked, remove dislike and add like
      const action = liked ? 'remove' : 'like';
      console.log('Like action:', action, 'Current liked state:', liked);
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.post(`http://localhost:5000/api/videos/${videoId}/like`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Like response:', response.data);
      
      if (response.data.success) {
        setVideo(prev => ({
          ...prev,
          likes: response.data.likes,
          dislikes: response.data.dislikes
        }));
        
        // Update local state based on action
        if (action === 'remove') {
          setLiked(false);
        } else {
          setLiked(true);
          setDisliked(false);
        }
      }
    } catch (err) {
      console.error('Failed to like video:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      // If already disliked, remove dislike. If liked, remove like and add dislike
      const action = disliked ? 'remove' : 'dislike';
      console.log('Dislike action:', action, 'Current disliked state:', disliked);
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.post(`http://localhost:5000/api/videos/${videoId}/dislike`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dislike response:', response.data);
      
      if (response.data.success) {
        setVideo(prev => ({
          ...prev,
          likes: response.data.likes,
          dislikes: response.data.dislikes
        }));
        
        // Update local state based on action
        if (action === 'remove') {
          setDisliked(false);
        } else {
          setDisliked(true);
          setLiked(false);
        }
      }
    } catch (err) {
      console.error('Failed to dislike video:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/comments`, {
        videoId,
        text: newComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleCommentUpdate = (commentId, newText) => {
    console.log('Updating comment:', commentId, 'with new text:', newText);
    setComments(prev => {
      const updated = prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, text: newText }
          : comment
      );
      console.log('Updated comments:', updated);
      return updated;
    });
  };

  const handleCommentDelete = (commentId) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };

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

  if (error) {
    return (
      <div className="video-player">
        <div className="video-player__error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
        {/* Video Player */}
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

        {/* Video Information */}
        <div className="video-player__info">
          <h1 className="video-player__title">{video.title}</h1>
          
          <div className="video-player__stats">
            <div className="video-player__views">
              {video.views?.toLocaleString()} views
            </div>
            <div className="video-player__actions">
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

          <div className="video-player__channel">
            <div className="video-player__channel-info">
              <h3>{video.channelId?.channelName || 'Unknown Channel'}</h3>
              <p>{video.description}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="video-player__comments">
          <h3>{comments.length} Comments</h3>
          
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
