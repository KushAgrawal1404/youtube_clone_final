# GitHub Link: https://github.com/KushAgrawal1404/youtube_clone_final
# Video Link: https://drive.google.com/file/d/1OEimmWQ09KRZ9xtzisZ9k9a-sBlNO2tR/view?usp=sharing

# YouTube Clone - Full Stack Application

A comprehensive YouTube clone application built with modern web technologies, featuring user authentication, video management, channel creation, and social features like comments and likes.

## 🚀 Project Overview

This project demonstrates a full-stack web application that replicates core YouTube functionality including:
- **User Authentication**: Secure login/signup with JWT tokens
- **Video Management**: Upload, view, edit, and delete videos
- **Channel System**: Create and manage content channels
- **Social Features**: Comments, likes/dislikes, and user interactions
- **Responsive Design**: Mobile-first approach with modern UI/UX

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RESTful API** with Express.js framework
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** for secure user sessions
- **Input Validation** using express-validator
- **File Upload** support for videos and thumbnails
- **CORS** enabled for frontend communication

### Frontend (React + Vite)
- **React 19** with modern hooks and functional components
- **Vite** build tool for fast development and optimized builds
- **React Router** for client-side navigation
- **Context API** for global state management
- **Responsive CSS** with modern design principles
- **Axios** for HTTP client communication

## 📁 Project Structure

```
youtube_clone_final/
├── backend/                 # Backend API server
│   ├── config.env          # Environment configuration
│   ├── server.js           # Main server entry point
│   ├── middleware/         # Authentication middleware
│   ├── models/            # MongoDB schemas and models
│   ├── routes/            # API route handlers
│   └── seedData.js        # Database seeding script
├── vite-project/           # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # Application entry point
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 🛠️ Technology Stack

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing

### Frontend Technologies
- **React 19** - JavaScript library for building user interfaces
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling and responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube_clone_final
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd vite-project
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Database Seeding (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

## 🔧 Configuration

### Environment Variables (Backend) 

Create a `config.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/youtube_clone
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

#### Channels
- `POST /api/channels/create` - Create new channel
- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get channel by ID
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

#### Videos
- `POST /api/videos` - Upload new video
- `GET /api/videos` - Get videos with filtering
- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/like` - Like/unlike video
- `POST /api/videos/:id/dislike` - Dislike/undislike video

#### Comments
- `POST /api/comments` - Add new comment
- `GET /api/comments/video/:videoId` - Get video comments
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

## 🎯 Features

### Core Functionality
- **User Management**: Registration, authentication, and profile management
- **Video System**: Upload, playback, and management
- **Channel Creation**: Personal content channels
- **Content Discovery**: Search, filtering, and categorization
- **Social Interaction**: Comments, likes, and dislikes

### User Experience
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean and intuitive interface
- **Real-time Updates**: Dynamic content loading
- **Search Functionality**: Find videos and channels
- **Navigation**: Intuitive routing and navigation

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Input Validation**: Server-side validation for all inputs
- **Authorization**: Role-based access control
- **CORS Protection**: Secure cross-origin requests

## 📱 Responsive Design

The application is built with a mobile-first approach and includes:
- Responsive grid layouts
- Mobile-friendly navigation
- Touch-optimized interactions
- Adaptive typography
- Flexible image handling

## 🔒 Security Considerations

- **JWT Tokens**: Secure authentication with expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Input Sanitization**: Validation and sanitization of all inputs
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Secure configuration management

## 🎥 Sample Videos for Testing

To help you test the YouTube clone application, here are some working video URLs that you can use directly in the upload form:

### **Free Sample Videos (Public Domain)**

#### 1. **Big Buck Bunny** - Technology/Education
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```
- **Category**: Technology, Education, Entertainment
- **Duration**: ~10 minutes
- **Size**: ~27MB
- **Description**: Open source animated film featuring Big Buck Bunny

#### 2. **Elephant's Dream** - Nature/Travel
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
```
- **Category**: Travel, Nature, Entertainment
- **Duration**: ~11 minutes
- **Size**: ~31MB
- **Description**: Open source animated film with nature themes

#### 3. **For Bigger Blazes** - Gaming/Entertainment
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
```
- **Category**: Gaming, Entertainment
- **Duration**: ~15 seconds
- **Size**: ~2.5MB
- **Description**: Short demo video for testing

#### 4. **For Bigger Escapes** - Music/Entertainment
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4
```
- **Category**: Music, Entertainment
- **Duration**: ~15 seconds
- **Size**: ~2.5MB
- **Description**: Short demo video for testing

### **How to Use Sample Videos**

1. **Copy any video URL** from the list above
2. **Paste it** in the video URL field during upload
3. **Add metadata**:
   - Title: Descriptive video title
   - Description: Video description
   - Category: Select appropriate category
   - Tags: Add relevant tags (e.g., "demo", "test", "sample")
4. **Upload** and test all features

### **Why These URLs Work**

- ✅ **Publicly Accessible**: No authentication required
- ✅ **MP4 Format**: Compatible with HTML5 video player
- ✅ **Stable Hosting**: Google's reliable infrastructure
- ✅ **Free to Use**: Open source content
- ✅ **Various Sizes**: Different file sizes for testing

### **Testing Different Scenarios**

- **Large Videos**: Use BigBuckBunny.mp4 (27MB) to test loading times
- **Short Videos**: Use ForBiggerBlazes.mp4 (15 seconds) for quick testing
- **Category Filtering**: Test all category filters with different videos
- **Search Functionality**: Test search with video titles and descriptions
- **Video Player**: Test playback, likes, dislikes, and comments


# GitHub Link: https://github.com/KushAgrawal1404/youtube_clone_final
# Video Link: https://drive.google.com/file/d/1OEimmWQ09KRZ9xtzisZ9k9a-sBlNO2tR/view?usp=sharing