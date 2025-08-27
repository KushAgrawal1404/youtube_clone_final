/**
 * Auth Page Component
 * 
 * Authentication page that handles both user login and registration.
 * Provides form validation, error handling, and seamless switching between auth modes.
 * Integrates with AuthContext for authentication state management.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

/**
 * Auth Page Component
 * 
 * Dual-mode authentication component supporting both login and signup functionality.
 * Features comprehensive form validation, real-time error clearing, and user feedback.
 * Automatically redirects users after successful authentication or registration.
 */
const Auth = () => {
  // Authentication mode state
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup modes
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // Form validation and UI state
  const [errors, setErrors] = useState({}); // Field-specific validation errors
  const [loading, setLoading] = useState(false); // Loading state during API calls
  const [message, setMessage] = useState(''); // Success/error messages from API

  // Navigation and authentication hooks
  const navigate = useNavigate(); // React Router navigation hook
  const { login, signup } = useAuth(); // Authentication context functions

  /**
   * Input Change Handler
   * 
   * Updates form state when input values change and clears field-specific errors.
   * Provides real-time error clearing for better user experience.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing in a field with an error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Form Validation Function
   * 
   * Validates form data based on current mode (login/signup) and field requirements.
   * Sets validation errors and returns boolean indicating if form is valid.
   */
  const validateForm = () => {
    const newErrors = {};

    // Username validation (only required for signup)
    if (!isLogin && (!formData.username || formData.username.length < 3)) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    // Email validation (required for both modes)
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (required for both modes)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form Submission Handler
   * 
   * Processes form submission for both login and signup modes.
   * Validates form data, calls appropriate authentication function, and handles responses.
   * Provides user feedback and navigation based on authentication results.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Handle login mode
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/'); // Redirect to home page on successful login
        } else {
          setMessage(result.message);
        }
      } else {
        // Handle signup mode
        const result = await signup(formData.username, formData.email, formData.password);
        if (result.success) {
          setMessage(result.message);
          // Auto-redirect to login after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ username: '', email: '', password: '' });
            setMessage('');
          }, 2000);
        } else {
          setMessage(result.message);
        }
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authentication Mode Toggle
   * 
   * Switches between login and signup modes, resetting form data and errors.
   * Provides seamless transition between authentication modes.
   */
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="auth">
      <div className="auth__container">
        {/* Page header with dynamic title and description */}
        <div className="auth__header">
          <h1>{isLogin ? 'Sign In' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your YouTube Clone account' : 'Join YouTube Clone today'}</p>
        </div>

        {/* Authentication form */}
        <form className="auth__form" onSubmit={handleSubmit}>
          {/* Username field - only shown in signup mode */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
                placeholder="Enter your username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
          )}

          {/* Email field - required for both modes */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password field - required for both modes */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Success/error message display */}
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* Submit button with loading state */}
          <button 
            type="submit" 
            className="auth__submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Footer with mode toggle */}
        <div className="auth__footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="auth__toggle-btn"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
