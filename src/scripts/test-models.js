// This script tests the MongoDB models to ensure they're correctly defined
// Run with: node src/scripts/test-models.js

const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachprep';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define a callback for when connection is ready
mongoose.connection.once('open', async () => {
  console.log('MongoDB connection is open and ready');
  
  try {
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Test User model
    const User = mongoose.connection.models.User || 
                mongoose.model('User', require('../models/User').default.schema);
    const usersCount = await User.countDocuments();
    console.log(`\nUsers in database: ${usersCount}`);
    
    if (usersCount > 0) {
      // List first 5 users without password field
      const users = await User.find().select('-password').limit(5);
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}), Role: ${user.role}, Department: ${user.department}`);
      });
    }
    
    // Test other collections if they exist
    if (collections.find(c => c.name === 'lessons')) {
      console.log('\nLessons exist in database');
    }
    
    if (collections.find(c => c.name === 'resources')) {
      console.log('\nResources exist in database');
    }
    
    if (collections.find(c => c.name === 'assessments')) {
      console.log('\nAssessments exist in database');
    }
    
    if (collections.find(c => c.name === 'settings')) {
      console.log('\nSettings exist in database');
    }
    
    console.log('\nModel test completed successfully');
  } catch (error) {
    console.error('Error testing models:', error);
  } finally {
    // Close the database connection
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}); 