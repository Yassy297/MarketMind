import type { Document } from 'mongoose';
import type { AppearancePreference } from './auth';
import type { UserMarketPreferences } from './market';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  watchlist: string[];
  avatar?: string;
  appearance?: AppearancePreference;
  preferences?: UserMarketPreferences;
  createdAt: Date;
  updatedAt: Date;
}
