/**
 * ProfileIcon Component
 * 
 * Generates circular profile icons with consistent colors based on user/channel names.
 * Displays the first letter of the name in a colored circle background.
 * Supports different sizes and container filling options.
 */

import React from 'react';
import './ProfileIcon.css';

/**
 * ProfileIcon Component
 * 
 * Creates a circular profile icon with a deterministic color based on the provided name.
 * The color is generated using a hash algorithm to ensure the same name always produces
 * the same color. Supports flexible sizing and container filling modes.

 */
const ProfileIcon = ({ name, size = 40, className = '', fillContainer = false }) => {
  /**
   * Color Generator
   * 
   * Generates a consistent color based on the input name using a hash algorithm.
   * The same name will always produce the same color, providing visual consistency.
   * Uses a predefined palette of visually appealing colors.
   */
  const generateColor = (name) => {
    // Predefined color palette with visually appealing colors
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    // Simple hash algorithm to generate consistent color index
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use modulo to select color from palette
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate background color and extract first letter
  const backgroundColor = generateColor(name);
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

  // Determine icon size based on fillContainer prop
  // If fillContainer is true, make the icon fill the entire container including borders
  const iconSize = fillContainer ? '100%' : `${size}px`;

  return (
    <div 
      className={`profile-icon ${className}`}
      style={{
        // Dynamic sizing based on props
        width: iconSize,
        height: iconSize,
        backgroundColor,
        
        // Dynamic font sizing based on icon size
        fontSize: fillContainer ? `${Math.max(size * 0.35, 12)}px` : `${Math.max(size * 0.4, 12)}px`,
        lineHeight: fillContainer ? `${size}px` : `${size}px`,
        
        // Layout and styling properties
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
      {/* Display the first letter of the name */}
      {firstLetter}
    </div>
  );
};

export default ProfileIcon;
