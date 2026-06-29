import type { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  watchlist: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
