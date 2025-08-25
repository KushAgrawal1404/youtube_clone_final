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

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      <Header 
        toggleSidebar={toggleSidebar} 
        isAuthenticated={isAuthenticated} 
        user={user} 
      />
      <div className="app__main">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`app__content ${sidebarOpen ? 'app__content--sidebar-open' : ''}`}>
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
