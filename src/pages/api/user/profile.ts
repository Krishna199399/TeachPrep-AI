import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedApiRequest } from '@/utils/authUtils';

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  // Only allow GET and PUT methods
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // User should be available because of the withAuth middleware
  const { user } = req;
  
  // Handle GET request - return the user profile
  if (req.method === 'GET') {
    return res.status(200).json({
      user,
      message: 'User profile retrieved successfully',
    });
  }
  
  // Handle PUT request - update the user profile
  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // In a real application, you would update the user in the database
      // For this demo, we'll just return the updated user
      const updatedUser = {
        ...user,
        ...updates,
      };
      
      return res.status(200).json({
        user: updatedUser,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

// Wrap the handler with our auth middleware
export default withAuth(handler); 