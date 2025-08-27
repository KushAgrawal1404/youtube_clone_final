/**
 * Sidebar Component
 * 
 * Navigation sidebar that provides access to different sections of the application.
 * Includes home, trending, subscriptions, library, and various category navigation.
 * Authentication-required items are conditionally rendered based on user login status.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

/**
 * Sidebar Component
 * 
 * Collapsible navigation sidebar with categorized navigation items.
 * Supports both public and authenticated-only navigation options.
 */
const Sidebar = ({ isOpen }) => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  // Authentication context to check user login status
  const { isAuthenticated } = useAuth();

  /**
   * Navigation Items Configuration
   * 
   * Array of sidebar navigation items with icons, labels, paths, and auth requirements.
   * Each item can be marked as requiring authentication with the 'auth: true' property.
   */
  const sidebarItems = [
    // Core navigation items
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔥', label: 'Trending', path: '/trending' },
    
    // Authentication-required items
    { icon: '📺', label: 'Subscriptions', path: '/subscriptions', auth: true },
    { icon: '📚', label: 'Library', path: '/library', auth: true },
    { icon: '⏰', label: 'History', path: '/history', auth: true },
    { icon: '👍', label: 'Liked Videos', path: '/liked', auth: true },
    { icon: '📤', label: 'Upload Video', path: '/upload', auth: true },
    
    // Category-based navigation items
    { icon: '🎵', label: 'Music', path: '/music' },
    { icon: '🎮', label: 'Gaming', path: '/gaming' },
    { icon: '📰', label: 'News', path: '/news' },
    { icon: '🏃', label: 'Sports', path: '/sports' },
    { icon: '🍳', label: 'Cooking', path: '/cooking' },
    { icon: '✈️', label: 'Travel', path: '/travel' },
    { icon: '💪', label: 'Fitness', path: '/fitness' },
    { icon: '🎭', label: 'Entertainment', path: '/entertainment' },
    { icon: '🔬', label: 'Science', path: '/science' },
    { icon: '🎓', label: 'Education', path: '/education' }
  ];

  /**
   * Navigation Item Click Handler
   * 
   * Handles clicks on sidebar navigation items and navigates to the specified path.
   */
  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__content">
        {/* Render navigation items with conditional authentication filtering */}
        {sidebarItems.map((item, index) => {
          // Skip authentication-required items if user is not logged in
          if (item.auth && !isAuthenticated) return null;
          
          return (
            <div
              key={index}
              className="sidebar__item"
              onClick={() => handleItemClick(item.path)}
            >
              {/* Navigation item icon */}
              <span className="sidebar__icon">{item.icon}</span>
              {/* Navigation item label */}
              <span className="sidebar__label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
