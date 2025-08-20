import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDb from './db';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

// Extended request interface with authenticated user
export interface AuthenticatedApiRequest extends NextApiRequest {
  user?: any;
}

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'teachprep-secret-key';

// Generate a JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

// Generate a mock token for development (before connecting to MongoDB)
export const generateMockToken = (): string => {
  return 'mock-token-' + Math.random().toString(36).substring(2, 15);
};

// Verify and decode a JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to authenticate API requests
export const withAuth = (handler: any) => {
  return async (req: AuthenticatedApiRequest, res: NextApiResponse) => {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Connect to database
      await connectDb();
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Set user on request object
      req.user = user;
      
      // Call the API handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password with hashed password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Validate JWT token and return user
export const validateToken = async (req: NextApiRequest) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Connect to database
    await connectDb();
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}; 