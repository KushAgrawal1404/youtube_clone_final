/**
 * YouTube Clone - Main Application Component
 * 
 * This is the root component that sets up the application structure,
 * routing, and authentication context. It provides the main layout
 * with header, sidebar, and content areas.
 */

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Channel from './pages/Channel';
import Channels from './pages/Channels';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import './App.css';

/**
 * AppContent Component
 * 
 * Main application content wrapper that handles the layout structure
 * and routing. Manages sidebar state and renders the appropriate
 * components based on the current route.
 */
function AppContent() {
  // State for controlling sidebar open/close functionality
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication context values
  const { isAuthenticated, user } = useAuth();

  /**
   * Toggle Sidebar Function 
   * Switches the sidebar between open and closed states.
   * Used by the header hamburger menu button.
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      {/* Header component with sidebar toggle and user authentication */}
      <Header
        toggleSidebar={toggleSidebar}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <div className="app__main">
        {/* Sidebar navigation component */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main content area with dynamic sidebar spacing */}
        <div className={`app__content ${sidebarOpen ? 'app__content--sidebar-open' : ''}`}>
          {/* Application routing configuration */}
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/video/:videoId" element={<VideoPlayer />} />

            <Route path="/channel/:channelId" element={<Channel />} />

            <Route path="/channels" element={<Channels />} />

            <Route path="/upload" element={<Upload />} />

            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

/**
 * App Component
 * 
 * Root component that wraps the entire application with necessary
 * providers and routing context. Sets up authentication and routing
 * at the application level.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
