# YouTube Clone Backend

A full-stack YouTube clone backend built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with validation
- **Channel Management**: Create, read, update, and delete channels
- **Video Management**: Full CRUD operations for videos with search and filtering
- **Comment System**: Full CRUD operations for comments
- **Search & Filter**: Text search and category-based filtering
- **Like/Dislike System**: For both videos and comments

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Password Hashing**: bcryptjs

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `config.env.example` to `config.env`
   - Update MongoDB connection string and JWT secret

3. **Database Setup**
   - Ensure MongoDB is running locally or update connection string
   - Run seed script to populate with sample data:
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Channels
- `POST /api/channels/create` - Create new channel
- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get channel by ID
- `GET /api/channels/user/:userId` - Get user's channels
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

### Videos
- `POST /api/videos` - Upload new video
- `GET /api/videos` - Get all videos (with filtering)
- `GET /api/videos/:id` - Get video by ID
- `GET /api/videos/channel/:channelId` - Get channel videos
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/like` - Like/dislike video

### Comments
- `POST /api/comments/add` - Add new comment
- `GET /api/comments/:videoId` - Get video comments
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment
- `POST /api/comments/:commentId/reaction` - Like/dislike comment

## Database Models

- **User**: Authentication and profile information
- **Channel**: Channel details and ownership
- **Video**: Video metadata and content
- **Comment**: User comments on videos

## Sample Data

The seed script creates:
- 3 sample users
- 3 sample channels
- 6 sample videos across different categories
- Sample comments

## Development

- **Port**: 5000 (configurable via environment)
- **Hot Reload**: Nodemon for development
- **ES Modules**: Full ES6+ module support
- **CORS**: Enabled for frontend integration

## File Structure

```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Authentication middleware
├── uploads/         # File uploads directory
├── server.js        # Main server file
├── seedData.js      # Database seeding script
└── package.json     # Dependencies and scripts
```
