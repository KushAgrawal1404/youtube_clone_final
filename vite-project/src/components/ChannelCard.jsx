import React from 'react';
import { Link } from 'react-router-dom';
import './ChannelCard.css';

const ChannelCard = ({ channel }) => {
  const formatSubscribers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link to={`/channel/${channel._id}`} className="channel-card">
      <div className="channel-card__banner">
        <img 
          src={channel.channelBanner || 'https://picsum.photos/400/100?random=30'} 
          alt={`${channel.channelName} banner`}
        />
      </div>
      
      <div className="channel-card__content">
        <div className="channel-card__avatar">
          <img 
            src={channel.owner?.avatar || 'https://picsum.photos/60/60?random=31'} 
            alt={channel.owner?.username || 'Channel owner'}
          />
        </div>
        
        <div className="channel-card__info">
          <h3 className="channel-card__name">{channel.channelName}</h3>
          <p className="channel-card__owner">
            {channel.owner?.username || 'Unknown User'}
          </p>
          <p className="channel-card__description">
            {channel.description}
          </p>
          <div className="channel-card__stats">
            <span className="channel-card__subscribers">
              {formatSubscribers(channel.subscribers)} subscribers
            </span>
            <span className="channel-card__videos">
              {channel.videos?.length || 0} videos
            </span>
          </div>
          <span className="channel-card__category">{channel.category}</span>
        </div>
      </div>
    </Link>
  );
};

export default ChannelCard;
