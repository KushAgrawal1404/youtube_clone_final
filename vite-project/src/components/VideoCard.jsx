/**
 * VideoCard Component
 * 
 * Displays video information in a card format for video listings and search results.
 * Shows thumbnail, title, channel info, view count, and upload date.
 * Handles image loading states and fallback thumbnails.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from './ProfileIcon';
import './VideoCard.css';

/**
 * VideoCard Component
 * 
 * Individual video card component that displays video metadata and navigates
 * to the video player page when clicked. Includes responsive image loading
 * and realistic duration generation for videos without duration data.
 */
const VideoCard = ({ video }) => {
  // Navigation hook for programmatic routing to video player
  const navigate = useNavigate();
  // State to track thumbnail image loading status
  const [imageLoaded, setImageLoaded] = useState(false);

  /**
   * Video Card Click Handler
   * 
   * Navigates to the video player page when the card is clicked.
   * Uses the video's unique ID to construct the route.
   */
  const handleClick = () => {
    navigate(`/video/${video._id}`);
  };

  /**
   * View Count Formatter
   * 
   * Formats view counts into human-readable format (e.g., 1.2K, 1.5M).
   * Provides better readability for large numbers.
   */
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  /**
   * Date Formatter
   * 
   * Converts upload date to relative time format (e.g., "2 days ago", "3 weeks ago").
   * Provides user-friendly time representation.
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  /**
   * Duration Generator
   * 
   * Generates realistic video duration for videos without duration metadata.
   * Uses video ID hash to create consistent, realistic durations between 2:30 and 15:45.
   */
  const getRealisticDuration = (video) => {
    // If video has a real duration, use it
    if (video.duration && video.duration !== '0:00') {
      return video.duration;
    }
    
    // Generate realistic duration based on video properties
    // Use video ID to generate consistent duration for same video
    let hash = 0;
    for (let i = 0; i < video._id.toString().length; i++) {
      const char = video._id.toString().charCodeAt(i);
      hash = ((hash << 5) - hash + char) >>> 0; // Use >>> 0 to ensure positive
    }
    
    // Generate duration between 2:30 and 15:45 (realistic YouTube video lengths)
    const baseMinutes = 2 + (hash % 14); // 2-15 minutes
    const baseSeconds = hash % 60; // 0-59 seconds
    
    // Ensure positive values
    const minutes = Math.abs(baseMinutes);
    const seconds = Math.abs(baseSeconds);
    
    // Format as MM:SS
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="video-card" onClick={handleClick}>
      {/* Video thumbnail section with duration overlay */}
      <div className="video-card__thumbnail">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to placeholder image if thumbnail fails to load
            e.target.src = 'https://via.placeholder.com/300x200?text=Video+Thumbnail';
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0.7, transition: 'opacity 0.3s ease' }}
        />
        {/* Video duration overlay on thumbnail */}
        <div className="video-card__duration">{getRealisticDuration(video)}</div>
      </div>
      
      {/* Video information section below thumbnail */}
      <div className="video-card__info">
        {/* Channel avatar */}
        <div className="video-card__avatar">
          <ProfileIcon 
            name={video.channelId?.channelName || 'Unknown Channel'} 
            size={36}
            className="profile-icon--small"
            fillContainer={true}
          />
        </div>
        
        {/* Video metadata details */}
        <div className="video-card__details">
          {/* Video title */}
          <h3 className="video-card__title">{video.title}</h3>
          {/* Channel name */}
          <p className="video-card__channel">{video.channelId?.channelName || 'Unknown Channel'}</p>
          {/* View count and upload date */}
          <div className="video-card__stats">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDate(video.uploadDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
