import { NextApiRequest, NextApiResponse } from 'next';
import { seedDatabase } from '@/utils/seedData';

// This endpoint should only be used in development 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Seeding is not allowed in production environment'
    });
  }

  try {
    // Special admin key check for added security
    const { adminKey } = req.body;
    
    if (!adminKey || adminKey !== 'teachprep-seed-12345') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Valid admin key is required for database seeding'
      });
    }
    
    // Seed the database
    const result = await seedDatabase();
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error seeding database:', error);
    
    return res.status(500).json({ 
      error: 'Database seeding failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
} 