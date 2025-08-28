/**
 * Home Page Component
 * 
 * Main landing page that displays videos with category filtering and search functionality.
 * Fetches videos from the API, supports category-based filtering, and displays search results.
 * Provides a responsive grid layout for video cards with loading states and empty states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import config from '../config.js';
import './Home.css';

/**
 * Home Page Component
 * 
 * Central hub for video discovery featuring category-based filtering, search integration,
 * and responsive video grid layout. Handles API data fetching, URL search parameters,
 * and provides user feedback for various states (loading, empty, search results).
 */
const Home = () => {
  // State management for videos and UI
  const [videos, setVideos] = useState([]); // Array of video objects from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [searchParams] = useSearchParams(); // React Router hook for URL search parameters
  const [selectedCategory, setSelectedCategory] = useState('All'); // Currently selected category filter

  /**
   * Available Video Categories
   * 
   * Predefined list of video categories for filtering content.
   * 'All' category shows videos from all categories.
   */
  const categories = [
    'All', 'Gaming', 'Education', 'Entertainment', 'Technology', 
    'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  // Extract search query from URL parameters
  const searchQuery = searchParams.get('search');

  /**
   * Video Fetching Function
   * 
   * Fetches videos from the API based on selected category and search query.
   * Constructs URL with query parameters and updates the videos state.
   * Uses useCallback to prevent unnecessary re-renders.
   */
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${config.API_BASE_URL}${config.API_ENDPOINTS.VIDEOS.BASE}`;
      const params = new URLSearchParams();
      
      // Add category filter if not 'All'
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      
      // Add search query if present
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Append query parameters to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  /**
   * Initialization Effect
   * 
   * Scrolls to top of page and fetches videos when component mounts or dependencies change.
   * Ensures proper page positioning and data loading on navigation.
   */
  useEffect(() => {
    // Scroll to top when home page loads
    window.scrollTo(0, 0);
    fetchVideos();
  }, [fetchVideos]);

  /**
   * Category Selection Handler
   * 
   * Updates the selected category and triggers video refetching.
   * Called when user clicks on category filter buttons.
   */
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Loading state display with category filters
  if (loading) {
    return (
      <div className="home">
        {/* Category filter buttons - always visible */}
        <div className="home__filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'filter-btn--active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Loading spinner and message */}
        <div className="home__loading">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Category filter section */}
      <div className="home__filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${selectedCategory === category ? 'filter-btn--active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search results header - only shown when search query exists */}
      {searchQuery && (
        <div className="home__search-results">
          <h2>Search results for: "{searchQuery}"</h2>
          <p>{videos.length} videos found</p>
        </div>
      )}

      {/* Conditional content rendering based on video availability */}
      {videos.length === 0 ? (
        /* Empty state when no videos are found */
        <div className="home__no-videos">
          <h2>No videos found</h2>
          <p>Try selecting a different category or search term.</p>
        </div>
      ) : (
        /* Video grid when videos are available */
        <div className="home__videos">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
