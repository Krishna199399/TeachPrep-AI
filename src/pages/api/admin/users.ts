import { NextApiRequest, NextApiResponse } from 'next';
import connectDb from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { withAuth, AuthenticatedApiRequest } from '@/utils/authUtils';
import { isAuthorized } from '@/utils/permissions';

// GET /api/admin/users - List all users
// POST /api/admin/users - Create a new user
// PUT /api/admin/users/:id - Update a user
// DELETE /api/admin/users/:id - Delete a user

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectDb();

    // Get the authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    // Check if user has permission to view users
    if (!isAuthorized(user, 'manage:users')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to manage users'
      });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getUsers(req, res);
      case 'POST':
        // Check if user has permission to create users
        if (!isAuthorized(user, 'manage:users')) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'You do not have permission to create users'
          });
        }
        return createUser(req, res);
      case 'PUT':
        // Check if user has permission to edit users
        if (!isAuthorized(user, 'manage:users')) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'You do not have permission to edit users'
          });
        }
        return updateUser(req, res);
      case 'DELETE':
        // Check if user has permission to delete users
        if (!isAuthorized(user, 'manage:users')) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'You do not have permission to delete users'
          });
        }
        return deleteUser(req, res);
      default:
        return res.status(405).json({ 
          error: 'Method not allowed',
          message: `The method ${req.method} is not allowed for this endpoint`
        });
    }
  } catch (error: any) {
    console.error('User management error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during user management',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// List all users
async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all users, excluding the password field
    const users = await User.find().select('-password');
    return res.status(200).json({ users });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Error fetching users',
      message: error.message
    });
  }
}

// Create a new user
async function createUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fullName, email, password, role, department } = req.body;
    
    // Check if all required fields are provided
    if (!fullName || !email || !password || !role || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Full name, email, password, role, and department are required'
      });
    }
    
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'A user with this email already exists'
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create the new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      department,
      status: 'active',
      lastActive: new Date()
    });
    
    // Save the user
    await newUser.save();
    
    // Return the new user without the password
    const userResponse = newUser.toObject() as Record<string, any>;
    delete userResponse.password;
    
    return res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Error creating user',
      message: error.message
    });
  }
}

// Update a user
async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { fullName, email, role, department, status } = req.body;
    
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    
    // If password is provided, hash and update it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    
    // Save the updated user
    await user.save();
    
    // Return the updated user without the password
    const userResponse = user.toObject() as Record<string, any>;
    delete userResponse.password;
    
    return res.status(200).json({ 
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Error updating user',
      message: error.message
    });
  }
}

// Delete a user
async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'User not found'
      });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    return res.status(200).json({ 
      message: 'User deleted successfully',
      id
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Error deleting user',
      message: error.message
    });
  }
}

export default withAuth(handler); 