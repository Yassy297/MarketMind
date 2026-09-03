import type { Document } from 'mongoose';
import type { UserMarketPreferences } from './market';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  watchlist: string[];
  avatar?: string;
  preferences?: UserMarketPreferences;
  createdAt: Date;
  updatedAt: Date;
}
