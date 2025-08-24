import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    navigate(`/video/${video._id}`);
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

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

  return (
    <div className="video-card" onClick={handleClick}>
      <div className="video-card__thumbnail">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Video+Thumbnail';
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0.7, transition: 'opacity 0.3s ease' }}
        />
        <div className="video-card__duration">{video.duration || '0:00'}</div>
      </div>
      
      <div className="video-card__info">
        <div className="video-card__avatar">
          <img 
            src={video.uploader?.avatar || 'https://via.placeholder.com/36x36?text=U'} 
            alt={video.uploader?.username || 'User'}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/36x36?text=U';
            }}
          />
        </div>
        
        <div className="video-card__details">
          <h3 className="video-card__title">{video.title}</h3>
          <p className="video-card__channel">{video.channelId?.channelName || 'Unknown Channel'}</p>
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
