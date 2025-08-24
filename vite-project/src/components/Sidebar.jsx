import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const sidebarItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔥', label: 'Trending', path: '/trending' },
    { icon: '📺', label: 'Subscriptions', path: '/subscriptions', auth: true },
    { icon: '📚', label: 'Library', path: '/library', auth: true },
    { icon: '⏰', label: 'History', path: '/history', auth: true },
    { icon: '👍', label: 'Liked Videos', path: '/liked', auth: true },
    { icon: '📤', label: 'Upload Video', path: '/upload', auth: true },
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

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__content">
        {sidebarItems.map((item, index) => {
          // Skip auth-only items if user is not authenticated
          if (item.auth && !isAuthenticated) return null;
          
          return (
            <div
              key={index}
              className="sidebar__item"
              onClick={() => handleItemClick(item.path)}
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
