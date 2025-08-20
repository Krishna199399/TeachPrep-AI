import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedApiRequest } from '@/utils/authUtils';
import { isAuthorized } from '@/utils/permissions';
import connectDb from '@/utils/db';
import Setting from '@/models/Setting';

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  // Ensure only GET and POST methods are allowed
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // User should be available because of the withAuth middleware
  const { user } = req;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Connect to the database
  try {
    await connectDb();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Check if the user has permission to manage settings
  if (!isAuthorized(user, 'manage:settings')) {
    return res.status(403).json({ 
      error: 'Permission denied', 
      message: 'You do not have permission to manage system settings.' 
    });
  }
  
  // Handle GET request - return current settings
  if (req.method === 'GET') {
    try {
      // Get all settings
      const settings = await Setting.find();
      
      // If no settings found, return empty array
      if (!settings || settings.length === 0) {
        return res.status(200).json({
          settings: [],
          message: 'No settings found',
        });
      }
      
      // Convert to a more user-friendly format
      const formattedSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
      
      return res.status(200).json({
        settings: formattedSettings,
        message: 'Settings retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ error: 'Failed to retrieve settings' });
    }
  }
  
  // Handle POST request - update settings
  if (req.method === 'POST') {
    try {
      const { settings } = req.body;
      
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid request', 
          message: 'Settings object is required.' 
        });
      }
      
      // Update or create each setting
      const updatePromises = Object.entries(settings).map(async ([key, value]) => {
        // Find and update, or create if not exists
        const result = await Setting.findOneAndUpdate(
          { key },
          { key, value, updatedBy: user._id },
          { upsert: true, new: true }
        );
        return result;
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      return res.status(200).json({ 
        message: 'Settings updated successfully',
        settings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }
}

// Wrap the handler with our auth middleware
export default withAuth(handler); 