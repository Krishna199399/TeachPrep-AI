import { NextApiRequest, NextApiResponse } from 'next';
import { comparePassword, generateToken } from '@/utils/authUtils';
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

    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);

    // Basic validation
    if (!email || !password) {
      console.log('Login validation failed - missing fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email and password are required' 
      });
    }

    // Find user by email - include password for authentication
    console.log('Finding user by email...');
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists
    if (!user) {
      console.log('Login failed - user not found:', email);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password' 
      });
    }

    // Check if the account is active
    if (user.status !== 'active') {
      console.log('Login failed - account not active:', email);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Your account is not active. Please contact an administrator.' 
      });
    }

    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.log('Login failed - invalid password:', email);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    console.log('Generating token...');
    const token = generateToken(String(user._id));

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();
    console.log('Updated last active timestamp for user:', email);

    // Return user info (without password) and token
    const userResponse = { ...user.toObject() } as Record<string, any>;
    delete userResponse.password;

    console.log('Login successful for:', email);
    return res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('Login error details:', error);
    
    // Provide more specific error messages based on error type
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 