import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';
import type { MarketProviderName } from '../config/markets';
import type { CountryCode, CurrencyCode, MarketCode } from '../types/market';

export interface IWatchlistItem {
  _id: Types.ObjectId;
  identityKey: string;
  instrumentId?: string;
  instrumentKey?: string;
  provider?: MarketProviderName;
  symbol: string;
  displaySymbol: string;
  companyName: string;
  market?: MarketCode;
  exchange?: string;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
  isin?: string;
  sortOrder: number;
  addedAt: Date;
}

export interface IWatchlist extends MongooseDocument {
  userId: Types.ObjectId;
  name?: string;
  normalizedName?: string;
  description?: string;
  sortOrder: number;
  items: IWatchlistItem[];
  /** Legacy single-list data retained so existing documents remain readable. */
  symbols?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlistItemSchema = new Schema<IWatchlistItem>(
  {
    identityKey: {
      type: String,
      required: true,
      trim: true
    },
    instrumentId: { type: String, trim: true },
    instrumentKey: { type: String, trim: true },
    provider: {
      type: String,
      enum: ['finnhub', 'upstox', 'twelveData'],
      default: undefined
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    displaySymbol: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    market: { type: String, enum: ['IN', 'US', 'GB', 'CA', 'AU', 'JP', 'CN', 'HK', 'SG', 'CH', 'KR', 'BR', 'MX', 'ZA', 'AE', 'SA', 'NZ', 'DE', 'FR', 'NL', 'ES', 'IT'] },
    exchange: { type: String, trim: true },
    countryCode: { type: String, enum: ['IN', 'US', 'GB', 'CA', 'AU', 'JP', 'CN', 'HK', 'SG', 'CH', 'KR', 'BR', 'MX', 'ZA', 'AE', 'SA', 'NZ', 'DE', 'FR', 'NL', 'ES', 'IT'] },
    currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'HKD', 'SGD', 'CHF', 'KRW', 'BRL', 'MXN', 'ZAR', 'AED', 'SAR', 'NZD'] },
    isin: { type: String, trim: true, uppercase: true },
    sortOrder: { type: Number, required: true, min: 0, default: 0 },
    addedAt: { type: Date, required: true, default: Date.now }
  },
  { _id: true }
);

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, trim: true },
    normalizedName: { type: String, trim: true, lowercase: true },
    description: { type: String, trim: true },
    sortOrder: { type: Number, min: 0, default: 0 },
    items: { type: [watchlistItemSchema], default: [] },
    symbols: { type: [String], default: undefined }
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, sortOrder: 1, createdAt: 1 });
watchlistSchema.index({ userId: 1, normalizedName: 1 }, { unique: true, sparse: true });

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
