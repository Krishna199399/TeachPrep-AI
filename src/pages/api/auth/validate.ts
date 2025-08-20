import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedApiRequest } from '@/utils/authUtils';
import User from '@/models/User';

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated (this is handled by withAuth middleware)
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or expired token' 
    });
  }

  // Update last active timestamp
  try {
    await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
  } catch (error) {
    console.error('Error updating last active timestamp:', error);
    // Continue anyway, not critical
  }

  // Return validation success
  return res.status(200).json({
    message: 'Token is valid',
    user: req.user
  });
}

// Wrap the handler with our auth middleware
export default withAuth(handler);