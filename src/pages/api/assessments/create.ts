import { NextApiRequest, NextApiResponse } from 'next';
import connectDb from '@/utils/db';
import Assessment from '@/models/Assessment';
import { validateToken } from '@/utils/authUtils';
import { isAuthorized } from '@/utils/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await validateToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has permission to create assessments
    if (!isAuthorized(user, 'create:assessment')) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to create assessments' });
    }

    // Connect to MongoDB
    await connectDb();

    // Create new assessment
    const {
      title,
      description,
      type,
      subject,
      grade,
      questions,
      dueDate,
      timeLimit,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !type || !subject || !grade) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, type, subject, and grade are required'
      });
    }

    // Create assessment
    const newAssessment = new Assessment({
      title,
      description,
      type,
      subject,
      grade,
      questions: questions || [],
      dueDate,
      timeLimit,
      status,
      createdBy: user._id,
      updatedBy: user._id
    });

    // Save to database
    await newAssessment.save();

    // Return success response
    return res.status(201).json({
      message: 'Assessment created successfully',
      assessment: newAssessment
    });
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    
    // Check if this is a MongoDB validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: 'Validation error',
        message: validationErrors.join(', ')
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while creating the assessment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 