import type { CurrencyCode, MarketCode } from '../config/markets';

export type JournalAssetClass =
  | 'equity'
  | 'etf'
  | 'mutual_fund'
  | 'crypto'
  | 'option'
  | 'future'
  | 'commodity'
  | 'forex'
  | 'bond'
  | 'reit'
  | 'other';

export type JournalDirection = 'LONG' | 'SHORT';
export type JournalStatus = 'OPEN' | 'CLOSED';

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

export type JournalTrade = {
  id: string;
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
  investedAmount: number | null;
  exitValue: number | null;
  grossPnl: number | null;
  netPnl: number | null;
  returnPercent: number | null;
  stopLoss?: number | null;
  target?: number | null;
  riskAmount: number | null;
  rewardAmount: number | null;
  riskRewardRatio: number | null;
  holdingDurationMs?: number | null;
  holdingDurationLabel?: string | null;
  holdingDurationStatus?: 'completed' | 'open' | null;
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
  attachments?: Array<{ name: string; url?: string; mimeType?: string; size?: number }>;
  assetDetails?: JournalAssetDetails;
  createdAt: string;
  updatedAt: string;
};

export type JournalTradeInput = Omit<
  JournalTrade,
  | 'id'
  | 'investedAmount'
  | 'exitValue'
  | 'grossPnl'
  | 'netPnl'
  | 'returnPercent'
  | 'riskAmount'
  | 'rewardAmount'
  | 'riskRewardRatio'
  | 'holdingDurationMs'
  | 'holdingDurationLabel'
  | 'holdingDurationStatus'
  | 'createdAt'
  | 'updatedAt'
>;

export type JournalListResponse = {
  items: JournalTrade[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type JournalStats = {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  netPnl: number;
  wins: number;
  losses: number;
  winRate: number | null;
};

export type JournalPerformanceSummary = {
  closedCount: number;
  wins: number;
  losses: number;
  breakeven: number;
  netPnl: number | null;
  averageTrade: number | null;
  averageWin: number | null;
  averageLoss: number | null;
  winRate: number | null;
  profitFactor: number | null;
  expectancy: number | null;
  averageReturn: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  sampleNote?: string;
};

export type JournalStreaks = {
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
};

export type JournalPnlPoint = {
  date: string;
  pnl: number;
  cumulative: number;
};

export type JournalMonthPoint = {
  month: string;
  trades: number;
  wins: number;
  losses: number;
  netPnl: number | null;
};

export type JournalOverview = {
  empty: boolean;
  totalTrades: number;
  openTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number | null;
  netPnl: number | null;
  averageTrade: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  performance: JournalPerformanceSummary;
  streaks: JournalStreaks;
  pnlOverTime: JournalPnlPoint[];
  monthly: JournalMonthPoint[];
};

export type JournalGroupRow = {
  key: string;
  trades: number;
  closedTrades: number;
  wins: number;
  losses: number;
  winRate: number | null;
  netPnl: number | null;
  averagePnl: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
};

export type JournalCalendarOutcome = 'PROFIT' | 'LOSS' | 'BREAKEVEN' | 'NO_TRADES';

export type JournalCalendarDaySummary = {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
  netPnl: number;
  outcome: JournalCalendarOutcome;
};

export type JournalCalendarMonth = {
  year: number;
  month: number;
  days: JournalCalendarDaySummary[];
  monthTrades: number;
  monthWins: number;
  monthLosses: number;
  monthNetPnl: number | null;
};

export type JournalCalendarDayTrade = {
  id: string;
  instrumentName: string;
  displaySymbol: string;
  direction: string;
  entryPrice: number;
  exitPrice: number | null;
  netPnl: number | null;
  strategy?: string;
  setup?: string;
  status: string;
  currency: string;
};

export type JournalCalendarDay = {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number | null;
  netPnl: number | null;
  items: JournalCalendarDayTrade[];
};

export type JournalAnalyticsReport =
  | 'performance'
  | 'strategy'
  | 'setup'
  | 'assetClass'
  | 'psychology'
  | 'time'
  | 'risk';

export type JournalAnalyticsFilters = {
  from?: string;
  to?: string;
  assetClass?: string;
  market?: string;
  direction?: string;
  strategy?: string;
  setup?: string;
};

export type JournalAnalyticsResponse =
  | {
      report: 'performance';
      empty: boolean;
      summary: JournalPerformanceSummary;
      streaks: JournalStreaks;
      pnlOverTime: JournalPnlPoint[];
      monthly: JournalMonthPoint[];
    }
  | {
      report: 'strategy' | 'setup' | 'assetClass';
      empty: boolean;
      rows: JournalGroupRow[];
    }
  | {
      report: 'psychology';
      empty: boolean;
      emotions: JournalGroupRow[];
      plan: JournalGroupRow[];
      confidence: JournalGroupRow[];
      mistakes: JournalGroupRow[];
    }
  | {
      report: 'time';
      empty: boolean;
      weekday: JournalGroupRow[];
      month: JournalMonthPoint[];
      duration: JournalGroupRow[];
      byHour: JournalGroupRow[] | null;
    }
  | {
      report: 'risk';
      empty: boolean;
      tradesWithStopLoss: number;
      tradesWithTarget: number;
      missingStopLoss: number;
      missingTarget: number;
      averagePlannedRr: number | null;
      averageRealizedReturn: number | null;
      planFollowed: number;
      planNotFollowed: number;
      planUnspecified: number;
      summary: JournalPerformanceSummary;
    };
