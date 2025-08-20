// This script tests user registration directly against MongoDB
// Run with: node src/scripts/register-test.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachprep';

// Simple User schema for this script
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  role: {
    type: String,
    enum: ['Administrator', 'Department Head', 'Teacher', 'Student Teacher'],
    default: 'Teacher',
  },
  department: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

async function testRegistration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Create a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const User = mongoose.model('User', UserSchema);
    
    // Hash the password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create the user
    console.log(`Creating test user with email: ${testEmail}`);
    const newUser = new User({
      fullName: 'Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'Teacher',
      department: 'Testing',
      status: 'active',
      lastActive: new Date()
    });
    
    // Save the user to the database
    console.log('Saving user to database...');
    const savedUser = await newUser.save();
    console.log('User registered successfully!');
    console.log(`User ID: ${savedUser._id}`);
    console.log(`Name: ${savedUser.fullName}`);
    console.log(`Email: ${savedUser.email}`);
    console.log(`Role: ${savedUser.role}`);
    console.log(`Department: ${savedUser.department}`);
    
    // List all users
    console.log('\nAll users in database:');
    const users = await User.find().select('fullName email role department');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role}, ${user.department}`);
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
    if (error.code === 11000) {
      console.error('Duplicate key error - email already exists');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testRegistration(); 