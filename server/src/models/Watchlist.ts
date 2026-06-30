import mongoose, { Schema, type Document as MongooseDocument } from 'mongoose';

export interface IWatchlist extends MongooseDocument {
  userId: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: String, required: true },
    symbols: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
