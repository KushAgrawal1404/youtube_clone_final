import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ toggleSidebar, isAuthenticated, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Close dropdown when clicking outside
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

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
      <div className="header__left">
        <button className="header__menu-btn" onClick={toggleSidebar}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        
        <div className="header__logo" onClick={handleLogoClick}>
          <div className="youtube-logo">
            <div className="youtube-icon">
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

      <div className="header__center">
        <form className="header__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header__search-input"
          />
          <button type="submit" className="header__search-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </form>
      </div>

      <div className="header__right">
        {isAuthenticated && (
          <>
            <button 
              className="header__upload-btn" 
              title="Upload Video"
              onClick={() => navigate('/upload')}
            >
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>📤</span>
            </button>
            <button 
              className="header__notification-btn" 
              title="Notifications"
            >
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>🔔</span>
            </button>
          </>
        )}
        {isAuthenticated ? (
          <div className="header__user" ref={dropdownRef}>
            <div 
              className="header__profile-icon"
              onClick={toggleDropdown}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {showDropdown && (
              <div className="header__dropdown">
                <div className="header__dropdown-item header__dropdown-user">
                  <div className="header__dropdown-avatar">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="header__dropdown-info">
                    <div className="header__dropdown-username">{user?.username}</div>
                    <div className="header__dropdown-email">{user?.email}</div>
                  </div>
                </div>
                <button 
                  className="header__dropdown-item header__dropdown-button"
                  onClick={() => handleDropdownClick('channels')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="header__dropdown-icon">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Channels
                </button>
                <button 
                  className="header__dropdown-item header__dropdown-button"
                  onClick={() => handleDropdownClick('upload')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="header__dropdown-icon">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                  Upload Video
                </button>
                <div className="header__dropdown-separator"></div>
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
          <button className="header__auth-btn" onClick={handleAuthClick}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
