// This script creates an admin user in the database
// Run with: node src/scripts/create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachprep';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define a simple user schema for this script
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['Administrator', 'Department Head', 'Teacher', 'Student Teacher'],
    default: 'Administrator',
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

// Create the model
const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@teachprep.ai' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      await mongoose.disconnect();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create admin user
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@teachprep.ai',
      password: hashedPassword,
      role: 'Administrator',
      department: 'Administration',
      status: 'active',
      lastActive: new Date()
    });
    
    // Save to database
    await adminUser.save();
    
    console.log('Admin user created successfully:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
  }
}

// Run the function
createAdminUser(); 