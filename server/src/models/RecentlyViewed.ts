import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';

export interface IRecentlyViewed extends MongooseDocument {
  user: Types.ObjectId;
  symbol: string;
  company: string;
  viewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recentlyViewedSchema = new Schema<IRecentlyViewed>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

recentlyViewedSchema.index({ user: 1, viewedAt: -1 });
recentlyViewedSchema.index({ user: 1, symbol: 1 }, { unique: true });

export const RecentlyViewed = mongoose.model<IRecentlyViewed>('RecentlyViewed', recentlyViewedSchema);
