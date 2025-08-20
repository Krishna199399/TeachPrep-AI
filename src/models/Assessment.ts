import mongoose, { Document, Model, Schema } from 'mongoose';

// Question interface for assessment questions
interface IQuestion {
  questionType: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
  questionText: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

// Assessment interface
export interface IAssessment extends Document {
  title: string;
  description: string;
  subject: string;
  grade: string;
  timeLimit?: number; // in minutes
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  department: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Question schema
const QuestionSchema: Schema = new Schema({
  questionType: {
    type: String,
    enum: ['multiple-choice', 'short-answer', 'essay', 'true-false'],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
  },
  correctAnswer: {
    type: Schema.Types.Mixed, // Could be string or number
  },
  points: {
    type: Number,
    default: 1,
  },
});

// Assessment schema
const AssessmentSchema: Schema = new Schema(
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
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
    },
    timeLimit: {
      type: Number, // in minutes
    },
    questions: {
      type: [QuestionSchema],
      default: [],
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export Assessment model
const Assessment: Model<IAssessment> = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);

export default Assessment; 