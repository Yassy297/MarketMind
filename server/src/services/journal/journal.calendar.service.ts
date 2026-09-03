import { Types } from 'mongoose';
import { JournalTrade } from '../../models/JournalTrade';
import { JournalError } from './journal.service';
import { buildCalendarMonth, daysInMonth } from './journal.calendar';
import { summarizeClosedTrades } from './journal.analytics.math';
import { loadAnalyticsTrades } from './journal.analytics.service';

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export class JournalCalendarService {
  async month(userId: string, year: number, month: number) {
    if (!Number.isInteger(year) || year < 1970 || year > 2100) {
      throw new JournalError(400, 'Invalid year.');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new JournalError(400, 'Invalid month.');
    }
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth(year, month)).padStart(2, '0')}`;
    const trades = await loadAnalyticsTrades(userId, { from, to });
    const days = buildCalendarMonth(year, month, trades);
    const monthSummary = summarizeClosedTrades(trades);
    return {
      year,
      month,
      days,
      monthTrades: trades.length,
      monthWins: monthSummary.wins,
      monthLosses: monthSummary.losses,
      monthNetPnl: monthSummary.netPnl
    };
  }

  async day(userId: string, date: string) {
    if (!isIsoDate(date)) throw new JournalError(400, 'Use a YYYY-MM-DD date.');
    if (!Types.ObjectId.isValid(userId)) throw new JournalError(400, 'Invalid user.');
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    const docs = await JournalTrade.find({
      userId: new Types.ObjectId(userId),
      entryDate: { $gte: start, $lte: end }
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const items = docs.map((doc) => ({
      id: String(doc._id),
      instrumentName: doc.instrumentName,
      displaySymbol: doc.displaySymbol,
      direction: doc.direction,
      entryPrice: doc.entryPrice,
      exitPrice: doc.exitPrice ?? null,
      netPnl: doc.netPnl ?? null,
      strategy: doc.strategy,
      setup: doc.setup,
      status: doc.status,
      currency: doc.currency
    }));
    const closed = items.filter((item) => item.status === 'CLOSED' && typeof item.netPnl === 'number');
    const wins = closed.filter((item) => (item.netPnl as number) > 0).length;
    const losses = closed.filter((item) => (item.netPnl as number) < 0).length;
    const decided = wins + losses;
    return {
      date,
      trades: items.length,
      wins,
      losses,
      winRate: decided ? Math.round((wins / decided) * 1000) / 10 : null,
      netPnl: closed.length ? Math.round(closed.reduce((sum, item) => sum + (item.netPnl as number), 0) * 100) / 100 : null,
      items
    };
  }
}

export const journalCalendarService = new JournalCalendarService();
