import type { CurrencyCode, MarketCode } from './market';

export const JOURNAL_ASSET_CLASSES = [
  'equity',
  'etf',
  'mutual_fund',
  'crypto',
  'option',
  'future',
  'commodity',
  'forex',
  'bond',
  'reit',
  'other'
] as const;

export type JournalAssetClass = (typeof JOURNAL_ASSET_CLASSES)[number];

export const JOURNAL_DIRECTIONS = ['LONG', 'SHORT'] as const;
export type JournalDirection = (typeof JOURNAL_DIRECTIONS)[number];

export const JOURNAL_STATUSES = ['OPEN', 'CLOSED'] as const;
export type JournalStatus = (typeof JOURNAL_STATUSES)[number];

export const JOURNAL_MISTAKE_TAGS = [
  'FOMO',
  'Revenge Trade',
  'Overtrading',
  'Late Entry',
  'Early Exit',
  'Moved Stop Loss',
  'Ignored Setup',
  'Oversized',
  'No Confirmation',
  'Ignored Risk',
  'Emotional Decision',
  'Other'
] as const;

export const JOURNAL_EMOTIONS = [
  'Calm',
  'Confident',
  'Excited',
  'Fearful',
  'FOMO',
  'Angry',
  'Revenge',
  'Uncertain',
  'Neutral'
] as const;

export type JournalEmotion = (typeof JOURNAL_EMOTIONS)[number];

export type JournalAssetDetails = {
  exchange?: string;
  pair?: string;
  fundName?: string;
  units?: number | null;
  underlying?: string;
  optionType?: 'call' | 'put';
  strike?: number | null;
  expiry?: string;
  premium?: number | null;
  lots?: number | null;
  lotSize?: number | null;
  contract?: string;
  contractSize?: number | null;
  commodity?: string;
  currencyPair?: string;
  issuer?: string;
  faceValue?: number | null;
  coupon?: number | null;
  customName?: string;
};

export type JournalAttachment = {
  name: string;
  url?: string;
  mimeType?: string;
  size?: number;
};

export type JournalInstrumentSnapshot = {
  instrumentId?: string;
  symbol: string;
  displaySymbol: string;
  instrumentName: string;
  assetClass: JournalAssetClass;
  market?: MarketCode;
  exchange?: string;
  currency: CurrencyCode;
};

export type JournalTradeInput = {
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
  exitPrice?: number | null;
  quantity: number;
  entryDate: string;
  entryTime?: string;
  exitDate?: string | null;
  exitTime?: string;
  fees?: number;
  stopLoss?: number | null;
  target?: number | null;
  thesis?: string;
  entryReason?: string;
  exitReason?: string;
  strategy?: string;
  setup?: string;
  marketCondition?: string;
  tradeQuality?: number | null;
  executionNotes?: string;
  confidence?: number | null;
  emotionBefore?: string;
  emotionAfter?: string;
  followedPlan?: boolean | null;
  mistakeTags?: string[];
  lessonLearned?: string;
  whatWentRight?: string;
  whatWentWrong?: string;
  whatWouldDoDifferently?: string;
  notes?: string;
  tags?: string[];
  attachments?: JournalAttachment[];
  assetDetails?: JournalAssetDetails;
};

export type JournalHoldingDurationStatus = 'completed' | 'open';

export type JournalTradeRecord = JournalTradeInput & {
  id: string;
  investedAmount: number | null;
  exitValue: number | null;
  grossPnl: number | null;
  netPnl: number | null;
  returnPercent: number | null;
  riskAmount: number | null;
  rewardAmount: number | null;
  riskRewardRatio: number | null;
  holdingDurationMs: number | null;
  holdingDurationLabel: string | null;
  holdingDurationStatus: JournalHoldingDurationStatus | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Future extensions (not implemented):
 * - Multi-entry / partial-exit: keep the current single entry+exit as the summary
 *   and add an optional legs[] event list later. Do not replace this model.
 * - Pre-trade checklist: optional structured checklist on the same document,
 *   building on followedPlan, confidence, stop/target, and thesis.
 */

export type JournalListQuery = {
  search?: string;
  assetClass?: JournalAssetClass;
  market?: MarketCode;
  direction?: JournalDirection;
  status?: JournalStatus;
  strategy?: string;
  setup?: string;
  tags?: string[];
  from?: string;
  to?: string;
  outcome?: 'profitable' | 'losing';
  sort?: 'entryDate' | 'exitDate' | 'netPnl' | 'createdAt' | 'symbol';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};
