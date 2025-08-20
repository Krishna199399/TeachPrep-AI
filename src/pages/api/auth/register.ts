import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, generateToken } from '@/utils/authUtils';
import connectDb from '@/utils/db';
import User, { IUser } from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDb();
    console.log('Connected to MongoDB successfully');

    const { fullName, email, password, role, department } = req.body;
    
    console.log('Registration attempt for:', email, '(Role:', role, ', Department:', department, ')');

    // Basic validation
    if (!fullName || !email || !password || !role || !department) {
      console.log('Registration validation failed - missing fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Full name, email, password, role, and department are required' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed - email already in use:', email);
      return res.status(400).json({ 
        error: 'Registration failed',
        message: 'Email is already in use' 
      });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);

    // Create new user
    console.log('Creating new user...');
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      department,
      status: 'active', // Could set to 'pending' if email verification is required
      lastActive: new Date()
    });

    // Save user to database
    console.log('Saving user to database...');
    await newUser.save();
    console.log('User saved successfully with ID:', newUser._id);

    // Generate JWT token
    const token = generateToken(String(newUser._id));

    // Return new user (without password) and token
    const userResponse = { ...newUser.toObject() } as Record<string, any>;
    delete userResponse.password;

    console.log('Registration successful for:', email);
    return res.status(201).json({
      message: 'Registration successful',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('Registration error details:', error);
    
    // Check if this is a MongoDB validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: 'Validation error',
        message: validationErrors.join(', ')
      });
    }
    
    // Check if this is a MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Registration failed',
        message: 'Email is already in use'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 