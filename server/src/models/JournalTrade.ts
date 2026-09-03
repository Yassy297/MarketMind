import mongoose, { Schema, type Document as MongooseDocument, type Types } from 'mongoose';
import { CURRENCY_CONFIG } from '../config/currencies';
import { MARKET_CONFIG } from '../config/markets';
import {
  JOURNAL_ASSET_CLASSES,
  JOURNAL_DIRECTIONS,
  JOURNAL_STATUSES,
  type JournalAssetClass,
  type JournalAssetDetails,
  type JournalAttachment,
  type JournalDirection,
  type JournalStatus
} from '../types/journal';
import type { CurrencyCode, MarketCode } from '../types/market';

export interface IJournalTrade extends MongooseDocument {
  userId: Types.ObjectId;
  instrumentId?: string;
  symbol: string;
  displaySymbol: string;
  instrumentName: string;
  assetClass: JournalAssetClass;
  market?: MarketCode;
  exchange?: string;
  currency: CurrencyCode;
  direction: JournalDirection;
  status: JournalStatus;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: Date;
  entryTime?: string;
  exitDate?: Date;
  exitTime?: string;
  fees: number;
  investedAmount?: number;
  exitValue?: number;
  grossPnl?: number;
  netPnl?: number;
  returnPercent?: number;
  stopLoss?: number;
  target?: number;
  riskAmount?: number;
  rewardAmount?: number;
  riskRewardRatio?: number;
  thesis?: string;
  entryReason?: string;
  exitReason?: string;
  strategy?: string;
  setup?: string;
  marketCondition?: string;
  tradeQuality?: number;
  executionNotes?: string;
  confidence?: number;
  emotionBefore?: string;
  emotionAfter?: string;
  followedPlan?: boolean;
  mistakeTags: string[];
  lessonLearned?: string;
  whatWentRight?: string;
  whatWentWrong?: string;
  whatWouldDoDifferently?: string;
  notes?: string;
  tags: string[];
  attachments: JournalAttachment[];
  assetDetails?: JournalAssetDetails;
  createdAt: Date;
  updatedAt: Date;
}

const journalTradeSchema = new Schema<IJournalTrade>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    instrumentId: { type: String, trim: true },
    symbol: { type: String, required: true, trim: true, uppercase: true },
    displaySymbol: { type: String, required: true, trim: true },
    instrumentName: { type: String, required: true, trim: true },
    assetClass: { type: String, required: true, enum: JOURNAL_ASSET_CLASSES },
    market: { type: String, enum: Object.keys(MARKET_CONFIG) },
    exchange: { type: String, trim: true },
    currency: { type: String, required: true, enum: Object.keys(CURRENCY_CONFIG) },
    direction: { type: String, required: true, enum: JOURNAL_DIRECTIONS },
    status: { type: String, required: true, enum: JOURNAL_STATUSES },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    quantity: { type: Number, required: true },
    entryDate: { type: Date, required: true },
    entryTime: { type: String, trim: true },
    exitDate: { type: Date },
    exitTime: { type: String, trim: true },
    fees: { type: Number, default: 0 },
    investedAmount: { type: Number },
    exitValue: { type: Number },
    grossPnl: { type: Number },
    netPnl: { type: Number },
    returnPercent: { type: Number },
    stopLoss: { type: Number },
    target: { type: Number },
    riskAmount: { type: Number },
    rewardAmount: { type: Number },
    riskRewardRatio: { type: Number },
    thesis: { type: String, trim: true },
    entryReason: { type: String, trim: true },
    exitReason: { type: String, trim: true },
    strategy: { type: String, trim: true },
    setup: { type: String, trim: true },
    marketCondition: { type: String, trim: true },
    tradeQuality: { type: Number, min: 1, max: 5 },
    executionNotes: { type: String, trim: true },
    confidence: { type: Number },
    emotionBefore: { type: String, trim: true },
    emotionAfter: { type: String, trim: true },
    followedPlan: { type: Boolean },
    mistakeTags: { type: [String], default: [] },
    lessonLearned: { type: String, trim: true },
    whatWentRight: { type: String, trim: true },
    whatWentWrong: { type: String, trim: true },
    whatWouldDoDifferently: { type: String, trim: true },
    notes: { type: String, trim: true },
    tags: { type: [String], default: [] },
    attachments: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          url: { type: String, trim: true },
          mimeType: { type: String, trim: true },
          size: { type: Number }
        }
      ],
      default: []
    },
    assetDetails: { type: Schema.Types.Mixed }
    // Future: optional legs[] for scale-in/scale-out; optional checklist[] on this document.
  },
  { timestamps: true }
);

journalTradeSchema.index({ userId: 1, entryDate: -1 });
journalTradeSchema.index({ userId: 1, exitDate: -1 });
journalTradeSchema.index({ userId: 1, createdAt: -1 });
journalTradeSchema.index({ userId: 1, status: 1 });
journalTradeSchema.index({ userId: 1, assetClass: 1 });
journalTradeSchema.index({ userId: 1, strategy: 1 });
journalTradeSchema.index({ userId: 1, setup: 1 });
journalTradeSchema.index({ userId: 1, direction: 1 });
journalTradeSchema.index({ userId: 1, symbol: 1 });

export const JournalTrade = mongoose.model<IJournalTrade>('JournalTrade', journalTradeSchema);
