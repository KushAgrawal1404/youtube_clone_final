/**
 * User Model Schema
 * 
 * Defines the data structure and behavior for user accounts in the YouTube Clone application.
 * Includes password hashing, validation rules, and authentication methods.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema Definition
 * 
 * MongoDB schema for user accounts with comprehensive validation rules
 * and relationship references to channels.
 */
const userSchema = new mongoose.Schema({
  // Unique username for user identification and display
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  
  // User's email address for authentication and communication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // Normalize email addresses
    trim: true,
    // Email validation regex pattern
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Encrypted password for secure authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // User profile picture URL with default fallback
  avatar: {
    type: String,
    default: 'https://example.com/avatar/default.png'
  },
  
  // Array of channel IDs that the user owns or manages
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel' // Reference to Channel model for population
  }],
  
  // Timestamp when user account was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Pre-save Middleware: Password Hashing
 * 
 * Automatically hashes the password before saving to database.
 * Only hashes if password field has been modified to avoid unnecessary re-hashing.
 */
userSchema.pre('save', async function(next) {
  // Skip hashing if password hasn't changed
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt with 12 rounds for security
    const salt = await bcrypt.genSalt(12);
    // Hash password with generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: Password Comparison
 * 
 * Compares a candidate password with the stored hashed password.
 * Used during login authentication.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

export default User;
