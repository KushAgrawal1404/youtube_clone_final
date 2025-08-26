import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Channel from './models/Channel.js';
import Video from './models/Video.js';
import Comment from './models/Comment.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Sample data
const sampleUsers = [
  {
    username: "JohnDoe",
    email: "john@example.com",
    password: "password123",
    avatar: "https://picsum.photos/100/100?random=10"
  },
  {
    username: "JaneSmith",
    email: "jane@example.com",
    password: "password123",
    avatar: "https://picsum.photos/100/100?random=11"
  },
  {
    username: "TechGuru",
    email: "tech@example.com",
    password: "password123",
    avatar: "https://picsum.photos/100/100?random=12"
  }
];

const sampleChannels = [
  {
    channelName: "Code with John",
    description: "Coding tutorials and tech reviews by John Doe.",
    channelBanner: "https://picsum.photos/1200/200?random=20",
    category: "Technology"
  },
  {
    channelName: "Jane's Kitchen",
    description: "Delicious recipes and cooking tips from Jane Smith.",
    channelBanner: "https://picsum.photos/1200/200?random=21",
    category: "Food"
  },
  {
    channelName: "Tech Insights",
    description: "Latest technology trends and gadget reviews.",
    channelBanner: "https://picsum.photos/1200/200?random=22",
    category: "Technology"
  }
];

const sampleVideos = [
  {
    title: "Learn React in 30 Minutes",
    description: "A quick tutorial to get started with React.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/vADoIjhxW_E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD-nmfz4zhv-xs7Ca7r_oK8E4VoMg",
    category: "Technology",
    tags: ["react", "javascript", "tutorial"],
    duration: "9:56"
  },
  {
    title: "Easy Pasta Recipe",
    description: "Learn to make delicious pasta in just 20 minutes.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://cdn.create.vista.com/downloads/fad39991-b389-4dcb-8872-b7416a8a69c9_1024.jpeg",
    category: "Food",
    tags: ["cooking", "pasta", "recipe"],
    duration: "11:01"
  },
  {
    title: "JavaScript Fundamentals",
    description: "Complete guide to JavaScript basics for beginners.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://www.anonymacademy.com/wp-content/uploads/2025/05/Purple-and-White-Simple-Gaming-Youtube-Thumbnail.png",
    category: "Education",
    tags: ["javascript", "programming", "tutorial"],
    duration: "15:00"
  },
  {
    title: "Gaming Setup Tour",
    description: "Check out my ultimate gaming setup and equipment.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/YmlC1HRjN04/maxresdefault.jpg",
    category: "Gaming",
    tags: ["gaming", "setup", "equipment"],
    duration: "15:00"
  },
  {
    title: "Morning Workout Routine",
    description: "Start your day with this energizing workout.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/Ao1tzPTm-40/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBRVF8hpV3N4942be-BsXWudHx8gg",
    category: "Fitness",
    tags: ["workout", "fitness", "morning"],
    duration: "15:00"
  },
  {
    title: "Travel Vlog - Paris",
    description: "Exploring the beautiful city of Paris.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://i.pinimg.com/736x/a7/9d/e8/a79de83cd2c3c9637f5272eb73488d7f.jpg",
    category: "Travel",
    tags: ["travel", "paris", "vlog"],
    duration: "15:00"
  }
];

const sampleComments = [
  {
    text: "Great video! Very helpful tutorial."
  },
  {
    text: "Thanks for sharing this! I learned a lot."
  },
  {
    text: "This is exactly what I was looking for."
  },
  {
    text: "Could you make more videos like this?"
  },
  {
    text: "I've been trying to learn this for weeks!"
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Channel.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create channels
    const createdChannels = [];
    for (let i = 0; i < sampleChannels.length; i++) {
      const channelData = {
        ...sampleChannels[i],
        owner: createdUsers[i]._id
      };
      const channel = new Channel(channelData);
      await channel.save();
      createdChannels.push(channel);
      console.log(`Created channel: ${channel.channelName}`);

      // Add channel to user
      await User.findByIdAndUpdate(
        createdUsers[i]._id,
        { $push: { channels: channel._id } }
      );
    }

    // Create videos
    const createdVideos = [];
    for (let i = 0; i < sampleVideos.length; i++) {
      const videoData = {
        ...sampleVideos[i],
        channelId: createdChannels[i % createdChannels.length]._id,
        uploader: createdUsers[i % createdUsers.length]._id,
        views: Math.floor(Math.random() * 10000) + 1000,
        likes: Math.floor(Math.random() * 500) + 50,
        dislikes: Math.floor(Math.random() * 50) + 5,
        userLikes: [],
        userDislikes: []
      };
      const video = new Video(videoData);
      await video.save();
      createdVideos.push(video);
      console.log(`Created video: ${video.title}`);

      // Add video to channel
      await Channel.findByIdAndUpdate(
        video.channelId,
        { $push: { videos: video._id } }
      );
    }

    // Create simple comments
    for (let i = 0; i < sampleComments.length; i++) {
      const commentData = {
        ...sampleComments[i],
        videoId: createdVideos[i % createdVideos.length]._id,
        userId: createdUsers[i % createdUsers.length]._id
      };
      
      const comment = new Comment(commentData);
      await comment.save();
      console.log(`Created comment: ${comment.text.substring(0, 30)}...`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed function
seedDatabase();
