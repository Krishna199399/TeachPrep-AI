import mongoose, { Document, Model, Schema } from 'mongoose';

// Resource interface
export interface IResource extends Document {
  title: string;
  description: string;
  resourceType: 'document' | 'image' | 'video' | 'link' | 'interactive';
  contentUrl: string;
  subject: string;
  createdBy: mongoose.Types.ObjectId;
  department: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  feedback?: string;
  license: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Resource schema
const ResourceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    resourceType: {
      type: String,
      enum: ['document', 'image', 'video', 'link', 'interactive'],
      required: [true, 'Resource type is required'],
    },
    contentUrl: {
      type: String,
      required: [true, 'Content URL is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    feedback: {
      type: String,
    },
    license: {
      type: String,
      default: 'cc-by',
    },
    tags: [{
      type: String,
      trim: true
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create search index for resources
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Create and export Resource model
const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource; 