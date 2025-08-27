/**
 * Header Component
 * 
 * Main navigation header that provides search functionality, user authentication,
 * and navigation controls. Includes sidebar toggle, search bar, and user profile
 * dropdown with various actions.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

/**
 * Header Component
 * 
 * Top-level navigation component with search, authentication, and user controls.
 * Responsive design with mobile-friendly sidebar toggle and dropdown menus.
 */
const Header = ({ toggleSidebar, isAuthenticated, user }) => {
  // Local state management
  const [searchQuery, setSearchQuery] = useState(''); // Search input value
  const [showDropdown, setShowDropdown] = useState(false); // Profile dropdown visibility
  
  // Refs and hooks
  const dropdownRef = useRef(null); // Reference for dropdown click outside detection
  const navigate = useNavigate(); // React Router navigation hook
  const { logout } = useAuth(); // Authentication context logout function

  /**
   * Click Outside Effect
   * 
   * Closes the profile dropdown when clicking outside of it.
   * Improves user experience by automatically hiding dropdowns.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Search Form Handler
   * 
   * Processes search form submission and navigates to home page
   * with search query parameters for video filtering.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /**
   * Authentication Button Handler
   * 
   * Handles authentication button clicks based on current state.
   * Logs out authenticated users or navigates to login page.
   */
  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  /**
   * Logo Click Handler
   * 
   * Navigates to home page when YouTube logo is clicked.
   * Provides consistent navigation behavior.
   */
  const handleLogoClick = () => {
    navigate('/');
  };

  /**
   * Dropdown Toggle Handler
   * 
   * Switches profile dropdown between open and closed states.
   */
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  /**
   * Dropdown Action Handler
   * 
   * Processes dropdown menu item clicks and performs appropriate actions.
   * Closes dropdown after action execution.
   */
  const handleDropdownClick = (action) => {
    setShowDropdown(false);
    if (action === 'signout') {
      handleAuthClick();
    } else if (action === 'channels') {
      navigate('/channels');
    } else if (action === 'upload') {
      navigate('/upload');
    }
  };

  return (
    <header className="header">
      {/* Left section: Menu button and logo */}
      <div className="header__left">
        {/* Hamburger menu button for mobile sidebar toggle */}
        <button className="header__menu-btn" onClick={toggleSidebar}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        
        {/* YouTube logo with click navigation to home */}
        <div className="header__logo" onClick={handleLogoClick}>
          <div className="youtube-logo">
            <div className="youtube-icon">
              {/* YouTube play button icon */}
              <svg viewBox="0 0 68 48" fill="none">
                <path d="M66.52,7.74c-0.78-2.93-3.09-5.24-6.02-6.02C55.79,0.13,34,0.13,34,0.13s-21.79,0-26.5,1.6c-2.93,0.78-5.24,3.09-6.02,6.02C0.13,12.21,0.13,24,0.13,24s0,11.79,1.6,16.5c0.78,2.93,3.09,5.24,6.02,6.02C12.21,47.87,34,47.87,34,47.87s21.79,0,26.5-1.6c2.93-0.78,5.24-3.09,6.02-6.02C67.87,35.79,67.87,24,67.87,24S67.87,12.21,66.52,7.74z" fill="#FF0000"/>
                <path d="M27.13,34.13L44.48,24L27.13,13.87V34.13z" fill="white"/>
              </svg>
            </div>
            <div className="youtube-text">
              <span>YouTube</span>
              <sup className="youtube-superscript">IN</sup>
            </div>
          </div>
        </div>
      </div>

      {/* Center section: Search functionality */}
      <div className="header__center">
        <form className="header__search" onSubmit={handleSearch}>
          {/* Search input field */}
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header__search-input"
          />
          {/* Search submit button */}
          <button type="submit" className="header__search-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Right section: User controls and authentication */}
      <div className="header__right">
        {/* Authenticated user controls */}
        {isAuthenticated && (
          <>
            {/* Upload video button */}
            <button 
              className="header__upload-btn" 
              title="Upload Video"
              onClick={() => navigate('/upload')}
            >
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>📤</span>
            </button>
            {/* Notifications button */}
            <button 
              className="header__notification-btn" 
              title="Notifications"
            >
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>🔔</span>
            </button>
          </>
        )}
        
        {/* User profile section */}
        {isAuthenticated ? (
          <div className="header__user" ref={dropdownRef}>
            {/* Profile icon with dropdown toggle */}
            <div 
              className="header__profile-icon"
              onClick={toggleDropdown}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            {/* Profile dropdown menu */}
            {showDropdown && (
              <div className="header__dropdown">
                {/* User info section */}
                <div className="header__dropdown-item header__dropdown-user">
                  <div className="header__dropdown-avatar">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="header__dropdown-info">
                    <div className="header__dropdown-username">{user?.username}</div>
                    <div className="header__dropdown-email">{user?.email}</div>
                  </div>
                </div>
                
                {/* Channels navigation */}
                <button 
                  className="header__dropdown-item header__dropdown-button"
                  onClick={() => handleDropdownClick('channels')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="header__dropdown-icon">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Channels
                </button>
                
                {/* Upload video option */}
                <button 
                  className="header__dropdown-item header__dropdown-button"
                  onClick={() => handleDropdownClick('upload')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="header__dropdown-icon">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                  Upload Video
                </button>
                
                {/* Visual separator */}
                <div className="header__dropdown-separator"></div>
                
                {/* Sign out option */}
                <button 
                  className="header__dropdown-item header__dropdown-button"
                  onClick={() => handleDropdownClick('signout')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="header__dropdown-icon">
                    <path d="M10.09 15.59L11.5 17l4.91-4.91L11.5 7l-1.41 1.41L13.67 11H3v2h10.67l-2.58 2.59z"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Sign in button for unauthenticated users */
          <button className="header__auth-btn" onClick={handleAuthClick}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
