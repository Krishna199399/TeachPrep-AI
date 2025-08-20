// This script tests the MongoDB connection and lists users
// Run with: node src/scripts/test-users.js

const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachprep';

// Simple User schema for this script
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: String,
  department: String,
  status: String,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
});

// Connect to MongoDB
async function testUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Get the User model (using the existing collection)
    const User = mongoose.model('User', UserSchema, 'users');
    
    // Count users
    const count = await User.countDocuments();
    console.log(`Found ${count} users in the database`);
    
    // List all users (without password)
    if (count > 0) {
      const users = await User.find().select('-password');
      console.log('\nUsers:');
      users.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}), Role: ${user.role}, Department: ${user.department}, Status: ${user.status}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testUsers(); 