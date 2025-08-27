/**
 * Authentication Context
 * 
 * Provides authentication state management throughout the application.
 * Handles user login, signup, logout, and token management with
 * automatic axios header configuration and localStorage persistence.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create authentication context for state sharing
const AuthContext = createContext();

/**
 * useAuth Hook
 * Custom hook to access authentication context values.
 * Must be used within an AuthProvider component.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * 
 * Context provider that manages authentication state and provides
 * authentication methods to child components. Handles token persistence,
 * automatic API header configuration, and user session validation.
 */
export const AuthProvider = ({ children }) => {
  // Authentication state management
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /**
   * Axios Header Configuration Effect
   * 
   * Automatically sets or removes Authorization header based on token state.
   * Ensures all API requests include authentication when user is logged in.
   */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  /**
   * Authentication Check Effect
   * 
   * Validates stored token on component mount by making an API call.
   * Automatically logs out user if token is invalid or expired.
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Verify token validity with backend
          const response = await axios.get('http://localhost:5000/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  /**
   * User Login Function
   * 
   * Authenticates user credentials and stores authentication data.
   * Updates axios headers and localStorage for persistent sessions.
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      // Update state and localStorage
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  /**
   * User Registration Function
   * 
   * Creates a new user account with provided credentials.
   * Note: This function only registers the user; login is required separately.
   */
  const signup = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        username,
        email,
        password
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  /**
   * User Logout Function
   * 
   * Clears all authentication data and resets application state.
   * Removes token from localStorage and axios headers.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Context value object with all authentication methods and state
  const value = {
    user,           // Current authenticated user data
    token,          // JWT authentication token
    loading,        // Loading state during authentication checks
    login,          // Login function
    signup,         // Registration function
    logout,         // Logout function
    isAuthenticated: !!token  // Boolean indicating authentication status
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
