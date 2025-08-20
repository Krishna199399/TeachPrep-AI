import mongoose, { Document, Model, Schema } from 'mongoose';

// Setting interface
export interface ISetting extends Document {
  key: string;
  value: any;
  category: 'general' | 'security' | 'content' | 'notifications' | 'advanced';
  description: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Setting schema
const SettingSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },
    category: {
      type: String,
      enum: ['general', 'security', 'content', 'notifications', 'advanced'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export Setting model
const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting; 