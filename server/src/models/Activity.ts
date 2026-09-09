import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';

export interface IActivity extends MongooseDocument {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  type: 'document' | 'watchlist' | 'conversation' | 'company_view' | 'journal';
  companySymbol?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['document', 'watchlist', 'conversation', 'company_view', 'journal'],
      required: true
    },
    companySymbol: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
