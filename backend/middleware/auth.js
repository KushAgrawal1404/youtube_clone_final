/**
 * Authentication Middleware
 * 
 * This module provides JWT-based authentication middleware for protecting API routes.
 * It includes both required authentication and optional authentication for different use cases.
 * 
 * @author: Student Developer
 * @version: 1.0.0
 * @date: 2024
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Required Authentication Middleware
 * 
 * Verifies JWT token from Authorization header and attaches user data to request object.
 * This middleware is used for routes that require user authentication.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @throws {401} When no token is provided
 * @throws {401} When token is invalid or expired
 * @throws {401} When user no longer exists in database
 */
export const auth = async (req, res, next) => {
  try {
    // Extract JWT token from Authorization header (Bearer token format)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No authentication token provided.' 
      });
    }

    // Verify and decode JWT token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from decoded token, excluding password field
    const user = await User.findById(decoded.userId).select('-password');
    
    // Verify user still exists in database
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User no longer exists.' 
      });
    }

    // Attach user data to request object for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT verification errors (expired, malformed, etc.)
    res.status(401).json({ 
      message: 'Invalid or expired authentication token.' 
    });
  }
};

/**
 * Optional Authentication Middleware
 * 
 * Similar to required auth but doesn't block requests if no token is provided.
 * Useful for routes that can work with or without authentication.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Route that shows different content for authenticated vs anonymous users
 * app.get('/videos', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // Show personalized content
 *   } else {
 *     // Show public content
 *   }
 * });
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If token exists, verify it and attach user data
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user;
    }
    
    // Always continue to next middleware/route regardless of token status
    next();
  } catch (error) {
    // Silently continue even if token verification fails
    // This allows the route to handle both authenticated and unauthenticated users
    next();
  }
};
