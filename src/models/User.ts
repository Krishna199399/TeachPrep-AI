import mongoose, { Document, Model, Schema } from 'mongoose';
import { Role } from '@/utils/permissions';

// User interface
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  status: 'active' | 'inactive';
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in query results by default
    },
    role: {
      type: String,
      enum: ['Administrator', 'Department Head', 'Teacher', 'Student Teacher'],
      default: 'Teacher',
    },
    department: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export User model
// Check if the model exists before creating a new one
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 