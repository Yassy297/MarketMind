import { Types } from 'mongoose';
import { JournalTrade } from '../../models/JournalTrade';
import { JournalError } from './journal.service';
import { calculateHoldingDuration } from './journal.duration';
import { buildJournalListFilter } from './journal.query';
import {
  confidenceBucket,
  computeStreaks,
  groupByKey,
  holdingBucket,
  monthlySeries,
  pnlSeries,
  summarizeClosedTrades,
  unspecified,
  weekdayLabel,
  type AnalyticsTrade
} from './journal.analytics.math';
import {
  JOURNAL_ASSET_CLASSES,
  type JournalAssetClass,
  type JournalDirection,
  type JournalListQuery
} from '../../types/journal';
import type { MarketCode } from '../../types/market';

export type JournalAnalyticsFilters = {
  from?: string;
  to?: string;
  assetClass?: JournalAssetClass;
  market?: MarketCode;
  direction?: JournalDirection;
  strategy?: string;
  setup?: string;
};

export type JournalAnalyticsReport =
  | 'performance'
  | 'strategy'
  | 'setup'
  | 'assetClass'
  | 'psychology'
  | 'time'
  | 'risk';

const toIso = (value?: Date) => (value ? value.toISOString().slice(0, 10) : undefined);

const toAnalyticsTrade = (doc: {
  _id: Types.ObjectId;
  entryDate: Date;
  entryTime?: string;
  exitDate?: Date;
  exitTime?: string;
  netPnl?: number | null;
  returnPercent?: number | null;
  status: 'OPEN' | 'CLOSED';
  strategy?: string;
  setup?: string;
  assetClass: string;
  direction: string;
  emotionBefore?: string;
  followedPlan?: boolean | null;
  mistakeTags?: string[];
  confidence?: number | null;
  stopLoss?: number | null;
  target?: number | null;
  riskRewardRatio?: number | null;
}): AnalyticsTrade => {
  const entryDate = toIso(doc.entryDate) ?? '';
  const exitDate = toIso(doc.exitDate);
  const duration = calculateHoldingDuration({
    status: doc.status,
    entryDate,
    entryTime: doc.entryTime,
    exitDate,
    exitTime: doc.exitTime
  });
  return {
    id: String(doc._id),
    entryDate,
    entryTime: doc.entryTime,
    exitDate,
    netPnl: doc.netPnl ?? null,
    returnPercent: doc.returnPercent ?? null,
    status: doc.status,
    strategy: doc.strategy,
    setup: doc.setup,
    assetClass: doc.assetClass,
    direction: doc.direction,
    emotionBefore: doc.emotionBefore,
    followedPlan: doc.followedPlan,
    mistakeTags: doc.mistakeTags,
    confidence: doc.confidence,
    stopLoss: doc.stopLoss,
    target: doc.target,
    riskRewardRatio: doc.riskRewardRatio,
    holdingDurationMs: duration.holdingDurationStatus === 'completed' ? duration.holdingDurationMs : null
  };
};

export const loadAnalyticsTrades = async (
  userId: string,
  filters: JournalAnalyticsFilters = {}
): Promise<AnalyticsTrade[]> => {
  if (!Types.ObjectId.isValid(userId)) throw new JournalError(400, 'Invalid user.');
  const query: JournalListQuery = { ...filters };
  const filter = buildJournalListFilter(userId, query);
  const docs = await JournalTrade.find(filter)
    .select(
      'entryDate entryTime exitDate exitTime netPnl returnPercent status strategy setup assetClass direction emotionBefore followedPlan mistakeTags confidence stopLoss target riskRewardRatio'
    )
    .sort({ entryDate: 1 })
    .limit(5000)
    .lean()
    .exec();
  return docs.map(toAnalyticsTrade);
};

export const buildOverview = (trades: AnalyticsTrade[]) => {
  const summary = summarizeClosedTrades(trades);
  const openTrades = trades.filter((item) => item.status === 'OPEN').length;
  return {
    empty: trades.length === 0,
    totalTrades: trades.length,
    openTrades,
    winningTrades: summary.wins,
    losingTrades: summary.losses,
    breakevenTrades: summary.breakeven,
    winRate: summary.winRate,
    netPnl: summary.netPnl,
    averageTrade: summary.averageTrade,
    bestTrade: summary.bestTrade,
    worstTrade: summary.worstTrade,
    performance: {
      ...summary,
      sampleNote:
        summary.closedCount < 20
          ? 'Based on a small sample of closed trades. Treat these figures as directional, not conclusive.'
          : undefined
    },
    streaks: computeStreaks(trades),
    pnlOverTime: pnlSeries(trades),
    monthly: monthlySeries(trades)
  };
};

export const buildReport = (report: JournalAnalyticsReport, trades: AnalyticsTrade[]) => {
  const summary = summarizeClosedTrades(trades);
  if (report === 'performance') {
    return { report, empty: trades.length === 0, summary, streaks: computeStreaks(trades), pnlOverTime: pnlSeries(trades), monthly: monthlySeries(trades) };
  }
  if (report === 'strategy') {
    return {
      report,
      empty: trades.length === 0,
      rows: groupByKey(trades, (item) => unspecified(item.strategy)).sort((left, right) => (right.netPnl ?? 0) - (left.netPnl ?? 0))
    };
  }
  if (report === 'setup') {
    return {
      report,
      empty: trades.length === 0,
      rows: groupByKey(trades, (item) => unspecified(item.setup)).sort((left, right) => (right.netPnl ?? 0) - (left.netPnl ?? 0))
    };
  }
  if (report === 'assetClass') {
    const grouped = groupByKey(trades, (item) => item.assetClass);
    const byKey = new Map(grouped.map((row) => [row.key, row]));
    return {
      report,
      empty: trades.length === 0,
      rows: JOURNAL_ASSET_CLASSES.map(
        (key) =>
          byKey.get(key) ?? {
            key,
            trades: 0,
            closedTrades: 0,
            wins: 0,
            losses: 0,
            winRate: null,
            netPnl: null,
            averagePnl: null,
            bestTrade: null,
            worstTrade: null
          }
      )
    };
  }
  if (report === 'psychology') {
    const emotions = groupByKey(trades, (item) => unspecified(item.emotionBefore));
    const plan = groupByKey(trades, (item) =>
      item.followedPlan === true ? 'Followed plan' : item.followedPlan === false ? 'Did not follow plan' : 'Unspecified'
    );
    const confidence = groupByKey(trades, (item) => `Confidence ${confidenceBucket(item.confidence)}`);
    const mistakes = groupByKey(
      trades.flatMap((item) => (item.mistakeTags ?? []).map((tag) => ({ ...item, strategy: tag }))),
      (item) => `Tagged ${item.strategy}`
    );
    return { report, empty: trades.length === 0, emotions, plan, confidence, mistakes };
  }
  if (report === 'time') {
    const weekday = groupByKey(trades, (item) => weekdayLabel(item.entryDate));
    const month = monthlySeries(trades);
    const duration = groupByKey(
      trades.filter((item) => holdingBucket(item.holdingDurationMs)),
      (item) => holdingBucket(item.holdingDurationMs) as string
    );
    const timed = trades.filter((item) => item.entryTime);
    const byHour =
      timed.length >= 5
        ? groupByKey(timed, (item) => `${item.entryTime?.slice(0, 2) ?? '00'}:00`)
        : null;
    return { report, empty: trades.length === 0, weekday, month, duration, byHour };
  }

  const withStop = trades.filter((item) => item.stopLoss !== null && item.stopLoss !== undefined).length;
  const withTarget = trades.filter((item) => item.target !== null && item.target !== undefined).length;
  const withRr = trades.filter((item) => typeof item.riskRewardRatio === 'number');
  const withReturn = trades.filter((item) => typeof item.returnPercent === 'number' && item.status === 'CLOSED');
  const planKnown = trades.filter((item) => item.followedPlan === true || item.followedPlan === false);
  return {
    report,
    empty: trades.length === 0,
    tradesWithStopLoss: withStop,
    tradesWithTarget: withTarget,
    missingStopLoss: trades.length - withStop,
    missingTarget: trades.length - withTarget,
    averagePlannedRr: withRr.length
      ? Math.round((withRr.reduce((sum, item) => sum + (item.riskRewardRatio as number), 0) / withRr.length) * 100) / 100
      : null,
    averageRealizedReturn: withReturn.length
      ? Math.round((withReturn.reduce((sum, item) => sum + (item.returnPercent as number), 0) / withReturn.length) * 100) / 100
      : null,
    planFollowed: planKnown.filter((item) => item.followedPlan).length,
    planNotFollowed: planKnown.filter((item) => item.followedPlan === false).length,
    planUnspecified: trades.length - planKnown.length,
    summary
  };
};

export class JournalAnalyticsService {
  async overview(userId: string, filters: JournalAnalyticsFilters = {}) {
    return buildOverview(await loadAnalyticsTrades(userId, filters));
  }

  async report(userId: string, report: JournalAnalyticsReport, filters: JournalAnalyticsFilters = {}) {
    return buildReport(report, await loadAnalyticsTrades(userId, filters));
  }
}

export const journalAnalyticsService = new JournalAnalyticsService();
