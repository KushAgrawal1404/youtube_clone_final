import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All', 'Gaming', 'Education', 'Entertainment', 'Technology', 
    'Music', 'Sports', 'News', 'Lifestyle', 'Comedy', 'Travel', 'Food', 'Fitness'
  ];

  const searchQuery = searchParams.get('search');

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/videos';
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
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

  useEffect(() => {
    // Scroll to top when home page loads
    window.scrollTo(0, 0);
    fetchVideos();
  }, [fetchVideos]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="home">
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
        <div className="home__loading">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
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

      {searchQuery && (
        <div className="home__search-results">
          <h2>Search results for: "{searchQuery}"</h2>
          <p>{videos.length} videos found</p>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="home__no-videos">
          <h2>No videos found</h2>
          <p>Try selecting a different category or search term.</p>
        </div>
      ) : (
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
