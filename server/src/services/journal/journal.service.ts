import { Types } from 'mongoose';
import { JournalTrade, type IJournalTrade } from '../../models/JournalTrade';
import type {
  JournalListQuery,
  JournalTradeInput,
  JournalTradeRecord
} from '../../types/journal';
import { calculateHoldingDuration } from './journal.duration';
import { calculateJournalFinancials } from './journal.pnl';
import { buildJournalListFilter, normalizeJournalListQuery } from './journal.query';
import { createJournalTradeSchema } from '../../validators/journal.validators';

export class JournalError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'JournalError';
  }
}

const toIsoDate = (value?: Date) => (value ? value.toISOString().slice(0, 10) : undefined);

const toRecord = (trade: IJournalTrade): JournalTradeRecord => {
  const entryDate = toIsoDate(trade.entryDate) ?? '';
  const exitDate = toIsoDate(trade.exitDate);
  const duration = calculateHoldingDuration({
    status: trade.status,
    entryDate,
    entryTime: trade.entryTime,
    exitDate,
    exitTime: trade.exitTime
  });
  return {
    id: trade.id,
    instrumentId: trade.instrumentId,
    symbol: trade.symbol,
    displaySymbol: trade.displaySymbol,
    instrumentName: trade.instrumentName,
    assetClass: trade.assetClass,
    market: trade.market,
    exchange: trade.exchange,
    currency: trade.currency,
    direction: trade.direction,
    status: trade.status,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    quantity: trade.quantity,
    entryDate,
    entryTime: trade.entryTime,
    exitDate,
    exitTime: trade.exitTime,
    fees: trade.fees,
    investedAmount: trade.investedAmount ?? null,
    exitValue: trade.exitValue ?? null,
    grossPnl: trade.grossPnl ?? null,
    netPnl: trade.netPnl ?? null,
    returnPercent: trade.returnPercent ?? null,
    stopLoss: trade.stopLoss,
    target: trade.target,
    riskAmount: trade.riskAmount ?? null,
    rewardAmount: trade.rewardAmount ?? null,
    riskRewardRatio: trade.riskRewardRatio ?? null,
    holdingDurationMs: duration.holdingDurationMs,
    holdingDurationLabel: duration.holdingDurationLabel,
    holdingDurationStatus: duration.holdingDurationStatus,
    thesis: trade.thesis,
    entryReason: trade.entryReason,
    exitReason: trade.exitReason,
    strategy: trade.strategy,
    setup: trade.setup,
    marketCondition: trade.marketCondition,
    tradeQuality: trade.tradeQuality,
    executionNotes: trade.executionNotes,
    confidence: trade.confidence,
    emotionBefore: trade.emotionBefore,
    emotionAfter: trade.emotionAfter,
    followedPlan: trade.followedPlan,
    mistakeTags: trade.mistakeTags,
    lessonLearned: trade.lessonLearned,
    whatWentRight: trade.whatWentRight,
    whatWentWrong: trade.whatWentWrong,
    whatWouldDoDifferently: trade.whatWouldDoDifferently,
    notes: trade.notes,
    tags: trade.tags,
    attachments: trade.attachments,
    assetDetails: trade.assetDetails,
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString()
  };
};

const applyFinancials = (input: JournalTradeInput) => {
  const financials = calculateJournalFinancials(input);
  return {
    ...input,
    ...financials,
    fees: input.fees ?? 0,
    entryDate: new Date(input.entryDate),
    exitDate: input.exitDate ? new Date(input.exitDate) : undefined,
    symbol: input.symbol.trim().toUpperCase(),
    displaySymbol: input.displaySymbol.trim(),
    instrumentName: input.instrumentName.trim()
  };
};

const requireObjectId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new JournalError(400, 'Invalid trade id.');
  }
  return id;
};

const scoped = (userId: string, id: string) => ({
  _id: requireObjectId(id),
  userId: new Types.ObjectId(userId)
});

export class JournalService {
  async create(userId: string, input: JournalTradeInput): Promise<JournalTradeRecord> {
    const trade = await JournalTrade.create({
      userId: new Types.ObjectId(userId),
      ...applyFinancials(input)
    });
    return toRecord(trade);
  }

  async list(userId: string, query: JournalListQuery) {
    const filter = buildJournalListFilter(userId, query);
    const { page, limit, skip, sort, order } = normalizeJournalListQuery(query);
    const [items, total] = await Promise.all([
      JournalTrade.find(filter)
        .sort({ [sort]: order } as Record<string, 1 | -1>)
        .skip(skip)
        .limit(limit)
        .exec(),
      JournalTrade.countDocuments(filter)
    ]);
    return {
      items: items.map(toRecord),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  async getById(userId: string, id: string): Promise<JournalTradeRecord> {
    const trade = await JournalTrade.findOne(scoped(userId, id));
    if (!trade) throw new JournalError(404, 'Trade not found.');
    return toRecord(trade);
  }

  async update(
    userId: string,
    id: string,
    patch: Partial<JournalTradeInput>
  ): Promise<JournalTradeRecord> {
    const existing = await JournalTrade.findOne(scoped(userId, id));
    if (!existing) throw new JournalError(404, 'Trade not found.');

    const merged: JournalTradeInput = {
      instrumentId: patch.instrumentId ?? existing.instrumentId,
      symbol: patch.symbol ?? existing.symbol,
      displaySymbol: patch.displaySymbol ?? existing.displaySymbol,
      instrumentName: patch.instrumentName ?? existing.instrumentName,
      assetClass: patch.assetClass ?? existing.assetClass,
      market: patch.market ?? existing.market,
      exchange: patch.exchange ?? existing.exchange,
      currency: patch.currency ?? existing.currency,
      direction: patch.direction ?? existing.direction,
      status: patch.status ?? existing.status,
      entryPrice: patch.entryPrice ?? existing.entryPrice,
      exitPrice: patch.exitPrice === undefined ? existing.exitPrice : patch.exitPrice,
      quantity: patch.quantity ?? existing.quantity,
      entryDate: patch.entryDate ?? toIsoDate(existing.entryDate) ?? '',
      entryTime: patch.entryTime ?? existing.entryTime,
      exitDate: patch.exitDate === undefined ? toIsoDate(existing.exitDate) : patch.exitDate,
      exitTime: patch.exitTime ?? existing.exitTime,
      fees: patch.fees ?? existing.fees,
      stopLoss: patch.stopLoss === undefined ? existing.stopLoss : patch.stopLoss,
      target: patch.target === undefined ? existing.target : patch.target,
      thesis: patch.thesis ?? existing.thesis,
      entryReason: patch.entryReason ?? existing.entryReason,
      exitReason: patch.exitReason ?? existing.exitReason,
      strategy: patch.strategy ?? existing.strategy,
      setup: patch.setup ?? existing.setup,
      marketCondition: patch.marketCondition ?? existing.marketCondition,
      tradeQuality: patch.tradeQuality === undefined ? existing.tradeQuality : patch.tradeQuality,
      executionNotes: patch.executionNotes ?? existing.executionNotes,
      confidence: patch.confidence === undefined ? existing.confidence : patch.confidence,
      emotionBefore: patch.emotionBefore ?? existing.emotionBefore,
      emotionAfter: patch.emotionAfter ?? existing.emotionAfter,
      followedPlan: patch.followedPlan === undefined ? existing.followedPlan : patch.followedPlan,
      mistakeTags: patch.mistakeTags ?? existing.mistakeTags,
      lessonLearned: patch.lessonLearned ?? existing.lessonLearned,
      whatWentRight: patch.whatWentRight ?? existing.whatWentRight,
      whatWentWrong: patch.whatWentWrong ?? existing.whatWentWrong,
      whatWouldDoDifferently: patch.whatWouldDoDifferently ?? existing.whatWouldDoDifferently,
      notes: patch.notes ?? existing.notes,
      tags: patch.tags ?? existing.tags,
      attachments: patch.attachments ?? existing.attachments,
      assetDetails: patch.assetDetails ?? existing.assetDetails
    };

    const parsed = createJournalTradeSchema.safeParse(merged);
    if (!parsed.success) {
      throw new JournalError(422, parsed.error.issues[0]?.message ?? 'Invalid trade update.');
    }

    existing.set(applyFinancials(parsed.data));
    await existing.save();
    return toRecord(existing);
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await JournalTrade.deleteOne(scoped(userId, id));
    if (result.deletedCount === 0) throw new JournalError(404, 'Trade not found.');
  }

  async duplicate(userId: string, id: string): Promise<JournalTradeRecord> {
    const existing = await this.getById(userId, id);
    const copy: JournalTradeInput = { ...existing };
    delete (copy as Partial<JournalTradeRecord>).id;
    delete (copy as Partial<JournalTradeRecord>).createdAt;
    delete (copy as Partial<JournalTradeRecord>).updatedAt;
    delete (copy as Partial<JournalTradeRecord>).holdingDurationMs;
    delete (copy as Partial<JournalTradeRecord>).holdingDurationLabel;
    delete (copy as Partial<JournalTradeRecord>).holdingDurationStatus;
    return this.create(userId, copy);
  }

  async stats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const [totalTrades, openTrades, closedTrades, aggregates] = await Promise.all([
      JournalTrade.countDocuments({ userId: userObjectId }),
      JournalTrade.countDocuments({ userId: userObjectId, status: 'OPEN' }),
      JournalTrade.countDocuments({ userId: userObjectId, status: 'CLOSED' }),
      JournalTrade.aggregate<{
        netPnl: number;
        wins: number;
        losses: number;
      }>([
        { $match: { userId: userObjectId, status: 'CLOSED' } },
        {
          $group: {
            _id: null,
            netPnl: { $sum: { $ifNull: ['$netPnl', 0] } },
            wins: { $sum: { $cond: [{ $gt: ['$netPnl', 0] }, 1, 0] } },
            losses: { $sum: { $cond: [{ $lt: ['$netPnl', 0] }, 1, 0] } }
          }
        }
      ])
    ]);
    const totals = aggregates[0];
    const closed = closedTrades || 0;
    return {
      totalTrades,
      openTrades,
      closedTrades,
      netPnl: totals?.netPnl ?? 0,
      wins: totals?.wins ?? 0,
      losses: totals?.losses ?? 0,
      winRate: closed ? Math.round(((totals?.wins ?? 0) / closed) * 1000) / 10 : null
    };
  }
}

export const journalService = new JournalService();
