/**
 * ChannelCard Component
 * 
 * Displays channel information in a card format for channel listings and search results.
 * Shows channel banner, avatar, name, description, subscriber count, and video count.
 * Links to the channel page when clicked.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import ProfileIcon from './ProfileIcon';
import './ChannelCard.css';

/**
 * ChannelCard Component
 * 
 * Individual channel card component that displays channel metadata and provides
 * navigation to the channel page. Includes subscriber count formatting and
 * fallback banner images.
 */
const ChannelCard = ({ channel }) => {
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

  return (
    <Link to={`/channel/${channel._id}`} className="channel-card">
      {/* Channel banner image section */}
      <div className="channel-card__banner">
        <img 
          src={channel.channelBanner || 'https://picsum.photos/400/100?random=30'} 
          alt={`${channel.channelName} banner`}
        />
      </div>
      
      {/* Channel content section below banner */}
      <div className="channel-card__content">
        {/* Channel avatar/profile icon */}
        <div className="channel-card__avatar">
          <ProfileIcon 
            name={channel.channelName} 
            size={60}
            className="profile-icon--large"
            fillContainer={true}
          />
        </div>
        
        {/* Channel information and metadata */}
        <div className="channel-card__info">
          {/* Channel name */}
          <h3 className="channel-card__name">{channel.channelName}</h3>
          {/* Channel description */}
          <p className="channel-card__description">
            {channel.description}
          </p>
          {/* Channel statistics */}
          <div className="channel-card__stats">
            {/* Subscriber count */}
            <span className="channel-card__subscribers">
              {formatSubscribers(channel.subscribers)} subscribers
            </span>
            {/* Video count */}
            <span className="channel-card__videos">
              {channel.videos?.length || 0} videos
            </span>
          </div>
          {/* Channel category */}
          <span className="channel-card__category">{channel.category}</span>
        </div>
      </div>
    </Link>
  );
};

export default ChannelCard;
