// This script tests the API endpoints for login and registration
// Run with: node src/scripts/test-api.js

const fetch = require('node-fetch');

// API base URL
const BASE_URL = 'http://localhost:3000/api';

// Test user data
const testUser = {
  fullName: 'API Test User',
  email: `api-test-${Date.now()}@example.com`,
  password: 'password123',
  role: 'Teacher',
  department: 'Testing'
};

// Function to test registration
async function testRegistration() {
  try {
    console.log('Testing registration API...');
    console.log(`Creating user with email: ${testUser.email}`);
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Registration failed:', data);
      return null;
    }
    
    console.log('Registration successful!');
    console.log('User data:', data.user);
    console.log('Token:', data.token ? 'Received token' : 'No token received');
    
    return data;
  } catch (error) {
    console.error('Error testing registration:', error);
    return null;
  }
}

// Function to test login
async function testLogin(email, password) {
  try {
    console.log('\nTesting login API...');
    console.log(`Logging in with email: ${email}`);
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login failed:', data);
      return null;
    }
    
    console.log('Login successful!');
    console.log('User data:', data.user);
    console.log('Token:', data.token ? 'Received token' : 'No token received');
    
    return data;
  } catch (error) {
    console.error('Error testing login:', error);
    return null;
  }
}

// Function to test getting user details
async function testUserDetails(token) {
  try {
    console.log('\nTesting user details API...');
    
    const response = await fetch(`${BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Getting user details failed:', data);
      return;
    }
    
    console.log('User details retrieved successfully!');
    console.log('User data:', data.user);
  } catch (error) {
    console.error('Error testing user details:', error);
  }
}

// Run the tests
async function runTests() {
  // Test registration
  const registrationResult = await testRegistration();
  
  if (registrationResult) {
    // Test login with the newly registered user
    const loginResult = await testLogin(testUser.email, testUser.password);
    
    if (loginResult && loginResult.token) {
      // Test getting user details
      await testUserDetails(loginResult.token);
    }
  }
  
  // Test login with admin user
  await testLogin('admin@teachprep.ai', 'password123');
  
  console.log('\nAPI tests completed!');
}

// Run the tests
runTests(); 