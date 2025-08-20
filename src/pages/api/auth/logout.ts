import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedApiRequest } from '@/utils/authUtils';
import User from '@/models/User';
import connectDb from '@/utils/db';

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated (this is handled by withAuth middleware)
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or expired token' 
    });
  }

  try {
    // Connect to database
    await connectDb();
    
    // Update last active timestamp
    await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
    
    // In a real implementation with refresh tokens, you would invalidate tokens here
    // For JWT without a blacklist, the client just discards the token
    
    return res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during logout' 
    });
  }
}

// Wrap the handler with our auth middleware
export default withAuth(handler); 