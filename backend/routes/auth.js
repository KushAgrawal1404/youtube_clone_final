/**
 * Authentication Routes
 * 
 * Handles user registration, login, and profile retrieval endpoints.
 * Includes input validation, JWT token generation, and secure password handling.
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

/**
 * Input Validation Middleware
 * 
 * Uses express-validator to ensure data integrity and security
 * for user registration and login operations.
 */

// Validation rules for user registration
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(), // Standardizes email format
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * JWT Token Generation Utility
 * 
 * Creates a JSON Web Token for authenticated user sessions.
 * Token expires after 7 days for security.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/signup - User Registration
 * 
 * Creates a new user account with validated input data.
 * Checks for existing users to prevent duplicates.
 */
router.post('/signup', validateRegistration, async (req, res) => {
  try {
    // Validate input data against defined rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check for existing users with same email or username
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Create and save new user (password will be hashed by User model middleware)
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully. Please login.',
      success: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * POST /api/auth/login - User Authentication
 * 
 * Authenticates user credentials and returns JWT token for session management.
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email address
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password using bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token for authenticated session
    const token = generateToken(user._id);

    // Return success response with token and user data (excluding password)
    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        channels: user.channels
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * GET /api/auth/me - Get Current User Profile
 * 
 * Retrieves authenticated user's profile information using JWT token.
 * Populates channel relationships for complete user data.
 */
router.get('/me', async (req, res) => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and populate channel relationships
    const user = await User.findById(decoded.userId)
      .select('-password') // Exclude password from response
      .populate('channels'); // Include channel details

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
});

export default router;
