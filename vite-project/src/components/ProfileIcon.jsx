import React from 'react';
import './ProfileIcon.css';

const ProfileIcon = ({ name, size = 40, className = '', fillContainer = false }) => {
  // Generate a consistent color based on the name
  const generateColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const backgroundColor = generateColor(name);
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

  // If fillContainer is true, make the icon fill the entire container including borders
  const iconSize = fillContainer ? '100%' : `${size}px`;

  return (
    <div 
      className={`profile-icon ${className}`}
      style={{
        width: iconSize,
        height: iconSize,
        backgroundColor,
        fontSize: fillContainer ? `${Math.max(size * 0.35, 12)}px` : `${Math.max(size * 0.4, 12)}px`,
        lineHeight: fillContainer ? `${size}px` : `${size}px`,
        minWidth: iconSize,
        minHeight: iconSize,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      {firstLetter}
    </div>
  );
};

export default ProfileIcon;
