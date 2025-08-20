import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedApiRequest } from '@/utils/authUtils';
import { isAuthorized } from '@/utils/permissions';
import connectDb from '@/utils/db';
import Lesson, { ILesson } from '@/models/Lesson';
import Resource, { IResource } from '@/models/Resource';
import Assessment, { IAssessment } from '@/models/Assessment';
import User, { IUser } from '@/models/User';
import mongoose from 'mongoose';

// Unified approval type
type ApprovalItem = {
  _id: string;
  title: string;
  type: 'lesson' | 'resource' | 'assessment';
  submittedBy: {
    _id: string;
    fullName: string;
  };
  submittedDate: Date;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  content?: string;
  description?: string;
  resourceType?: string;
  subject?: string;
  grade?: string;
};

// Helper to safely cast the item type to a valid ApprovalItem type
function getItemType(type: string): 'lesson' | 'resource' | 'assessment' {
  if (type === 'lesson' || type === 'resource' || type === 'assessment') {
    return type;
  }
  // Default fallback, should never happen with proper validation
  return 'lesson';
}

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  // Only allow GET (list items) and PUT (update item status) methods
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await connectDb();
    
    // Get the authenticated user from the request
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user has permission to approve content
    if (!isAuthorized(currentUser, 'approve:content')) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to approve content.'
      });
    }
    
    // Handle GET request - get pending items
    if (req.method === 'GET') {
      return getPendingItems(req, res);
    }
    
    // Handle PUT request - update item status
    if (req.method === 'PUT') {
      return updateItemStatus(req, res);
    }
  } catch (error: any) {
    console.error('Error in approval queue handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Get all items pending approval
async function getPendingItems(req: AuthenticatedApiRequest, res: NextApiResponse) {
  try {
    // Get query parameters
    const { type = 'all' } = req.query;
    
    // Get the user's department for filtering
    const currentUser = req.user!;
    const userDepartment = currentUser.department;
    const isAdmin = currentUser.role === 'Administrator';
    
    // Check what types of content the user can approve
    const canApproveLessons = isAuthorized(currentUser, 'approve:content');
    const canApproveResources = isAuthorized(currentUser, 'approve:content');
    const canApproveAssessments = isAuthorized(currentUser, 'approve:content');
    
    // Define base query - only get pending items
    const baseQuery = { status: 'pending' };
    
    // For department heads, only show items from their department
    // Administrators can see all items
    const departmentQuery = isAdmin ? {} : { department: userDepartment };
    const query = { ...baseQuery, ...departmentQuery };
    
    // Initialize responses
    let lessons: ILesson[] = [];
    let resources: IResource[] = [];
    let assessments: IAssessment[] = [];
    
    // Get pending lessons if requested and user has permission
    if ((type === 'all' || type === 'lessons') && canApproveLessons) {
      lessons = await Lesson.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });
    }
    
    // Get pending resources if requested and user has permission
    if ((type === 'all' || type === 'resources') && canApproveResources) {
      resources = await Resource.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });
    }
    
    // Get pending assessments if requested and user has permission
    if ((type === 'all' || type === 'assessments') && canApproveAssessments) {
      assessments = await Assessment.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });
    }
    
    // Return the combined results
    return res.status(200).json({
      lessons,
      resources,
      assessments,
      count: {
        lessons: lessons.length,
        resources: resources.length,
        assessments: assessments.length,
        total: lessons.length + resources.length + assessments.length
      }
    });
  } catch (error: any) {
    console.error('Error getting pending items:', error);
    return res.status(500).json({ 
      error: 'Failed to get pending items',
      message: error.message
    });
  }
}

// Update the status of an item (approve or reject)
async function updateItemStatus(req: AuthenticatedApiRequest, res: NextApiResponse) {
  try {
    const { id, type, status, feedback } = req.body;
    
    if (!id || !type || !status) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Item ID, type, and status are required'
      });
    }
    
    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Status must be either "approved" or "rejected"'
      });
    }
    
    // Get the current user
    const currentUser = req.user!;
    
    // Process based on content type
    if (type === 'lesson') {
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Lesson not found'
        });
      }
      
      // Check department permission for department heads
      if (currentUser.role === 'Department Head' && lesson.department !== currentUser.department) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only approve items in your department'
        });
      }
      
      // Update the lesson
      lesson.status = status;
      lesson.reviewedBy = currentUser._id;
      lesson.reviewedAt = new Date();
      if (feedback) lesson.feedback = feedback;
      await lesson.save();
      
      return res.status(200).json({
        message: `Lesson ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        item: lesson
      });
    } 
    else if (type === 'resource') {
      const resource = await Resource.findById(id);
      if (!resource) {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Resource not found'
        });
      }
      
      // Check department permission for department heads
      if (currentUser.role === 'Department Head' && resource.department !== currentUser.department) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only approve items in your department'
        });
      }
      
      // Update the resource
      resource.status = status;
      resource.reviewedBy = currentUser._id;
      resource.reviewedAt = new Date();
      if (feedback) resource.feedback = feedback;
      await resource.save();
      
      return res.status(200).json({
        message: `Resource ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        item: resource
      });
    } 
    else if (type === 'assessment') {
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Assessment not found'
        });
      }
      
      // Check department permission for department heads
      if (currentUser.role === 'Department Head' && assessment.department !== currentUser.department) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only approve items in your department'
        });
      }
      
      // Update the assessment
      assessment.status = status;
      assessment.reviewedBy = currentUser._id;
      assessment.reviewedAt = new Date();
      if (feedback) assessment.feedback = feedback;
      await assessment.save();
      
      return res.status(200).json({
        message: `Assessment ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        item: assessment
      });
    } 
    else {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Invalid item type. Must be lesson, resource, or assessment.'
      });
    }
  } catch (error: any) {
    console.error('Error updating item status:', error);
    return res.status(500).json({ 
      error: 'Failed to update item status',
      message: error.message
    });
  }
}

export default withAuth(handler); 