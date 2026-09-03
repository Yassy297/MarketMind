import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';
import type { MarketCode } from '../types/market';
import type { CountryCode, CurrencyCode } from '../types/market';
import { CURRENCY_CONFIG } from '../config/currencies';
import { MARKET_CONFIG } from '../config/markets';

export interface IRecentlyViewed extends MongooseDocument {
  user: Types.ObjectId;
  symbol: string;
  company: string;
  market?: MarketCode;
  exchange?: string;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
  isin?: string;
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
    market: {
      type: String,
      enum: Object.keys(MARKET_CONFIG),
      default: undefined
    },
    exchange: { type: String, default: undefined, trim: true },
    countryCode: { type: String, enum: Object.keys(MARKET_CONFIG), default: undefined },
    currency: { type: String, enum: Object.keys(CURRENCY_CONFIG), default: undefined },
    isin: { type: String, default: undefined, trim: true, uppercase: true },
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
