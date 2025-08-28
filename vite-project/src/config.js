/**
 * Application Configuration
 * 
 * Centralized configuration for API endpoints and environment variables.
 * Makes it easy to switch between development and production environments.
 */

const config = {
  // API base URL - change this for different environments
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // API endpoints
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      ME: '/api/auth/me'
    },
    VIDEOS: {
      BASE: '/api/videos',
      LIKE: (id) => `/api/videos/${id}/like`,
      DISLIKE: (id) => `/api/videos/${id}/dislike`,
      VIEW: (id) => `/api/videos/${id}/view`
    },
    COMMENTS: {
      BASE: '/api/comments',
      VIDEO: (id) => `/api/comments/video/${id}`
    },
    CHANNELS: {
      BASE: '/api/channels',
      CREATE: '/api/channels/create'
    }
  },

  // Helper function to build full API URLs
  getApiUrl: (endpoint) => `${config.API_BASE_URL}${endpoint}`
};

export default config;
