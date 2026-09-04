import mongoose, { Schema, type Document as MongooseDocument } from 'mongoose';
import type { AppearancePreference } from '../types/auth';
import type { UserMarketPreferences } from '../types/market';
import { MARKET_CONFIG } from '../config/markets';
import { CURRENCY_CONFIG } from '../config/currencies';

export interface IUser extends MongooseDocument {
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

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    watchlist: {
      type: [String],
      default: []
    },
    avatar: {
      type: String,
      default: undefined,
      trim: true
    },
    appearance: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system'
    },
    preferences: {
      type: new Schema(
        {
          country: { type: String, enum: [...Object.keys(MARKET_CONFIG), null], default: null },
          market: { type: String, enum: [...Object.keys(MARKET_CONFIG), null], default: null },
          currency: { type: String, enum: [...Object.keys(CURRENCY_CONFIG), null], default: null },
          currencyCustomized: { type: Boolean, default: undefined }
        },
        { _id: false }
      ),
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
