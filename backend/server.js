/**
 * YouTube Clone - Main Server File
 * 
 * This file serves as the entry point for the YouTube Clone backend API.
 * It configures the Express server, establishes database connections,
 * sets up middleware, and defines API routes.
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API route modules
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channels.js';
import videoRoutes from './routes/videos.js';
import commentRoutes from './routes/comments.js';

// Load environment variables from config file
dotenv.config({ path: './config.env' });

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 * 
 * CORS: Enables Cross-Origin Resource Sharing for frontend communication
 * JSON Parser: Parses incoming JSON payloads
 * URL Encoded: Handles form data submissions
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static File Serving
 * 
 * Serves uploaded video and image files from the uploads directory
 * Uses ES6 module compatibility for __dirname equivalent
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * MongoDB Database Connection
 * 
 * Establishes connection to MongoDB using connection string from environment variables
 * Logs connection status for debugging and monitoring
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/**
 * API Route Registration
 * 
 * Mounts different route modules to their respective endpoints:
 * - /api/auth: User authentication and registration
 * - /api/channels: Channel management operations
 * - /api/videos: Video upload, retrieval, and management
 * - /api/comments: Comment system functionality
 */
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);

/**
 * Health Check Endpoint
 * 
 * Provides a simple endpoint to verify API status
 * Useful for monitoring and load balancer health checks
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'YouTube Clone API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Global Error Handling Middleware
 * 
 * Catches any unhandled errors in the application
 * Logs error details for debugging
 * Returns generic error message to client for security
 */
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

/**
 * Server Initialization
 * 
 * Starts the Express server on the specified port
 * Logs server status for development and deployment monitoring
 */
app.listen(PORT, () => {
  console.log(`🚀 YouTube Clone Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
