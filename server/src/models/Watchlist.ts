import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';

export interface IWatchlist extends MongooseDocument {
  userId: Types.ObjectId;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    symbols: { type: [String], default: [] }
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, createdAt: -1 });

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
