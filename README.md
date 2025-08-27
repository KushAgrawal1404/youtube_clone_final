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
   
   # Create config.env file with your configuration
   cp config.env.example config.env
   
   # Update config.env with your MongoDB URI and JWT secret
   MONGODB_URI=mongodb://localhost:27017/youtube_clone
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   
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

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd vite-project
npm test
```

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

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure MongoDB Atlas or production database
4. Set up reverse proxy (Nginx/Apache)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to CDN or static hosting
3. Configure API endpoint URLs
4. Set up domain and SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add comprehensive tests
5. Submit a pull request

## 📄 License

This project is created for educational purposes and faculty demonstration.

## 👨‍💻 Author

**Student Developer** - YouTube Clone Project
- **Version**: 1.0.0
- **Date**: 2024

## 🙏 Acknowledgments

- YouTube for inspiration
- React and Node.js communities
- Modern web development tools and libraries

---

**Note**: This project is designed for educational purposes and demonstrates modern full-stack web development practices. It includes comprehensive documentation and professional code structure suitable for academic review.
