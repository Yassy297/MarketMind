import { isBreakeven, isLoss, isWin, type AnalyticsTrade } from './journal.analytics.math';

export type CalendarDayOutcome = 'PROFIT' | 'LOSS' | 'BREAKEVEN' | 'NO_TRADES';

export type CalendarDaySummary = {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
  netPnl: number;
  outcome: CalendarDayOutcome;
};

const isoDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

export const buildCalendarMonth = (
  year: number,
  month: number,
  trades: AnalyticsTrade[]
): CalendarDaySummary[] => {
  const byDate = new Map<string, AnalyticsTrade[]>();
  for (const trade of trades) {
    const list = byDate.get(trade.entryDate) ?? [];
    list.push(trade);
    byDate.set(trade.entryDate, list);
  }

  const lastDay = daysInMonth(year, month);
  const days: CalendarDaySummary[] = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const date = isoDate(year, month, day);
    const items = byDate.get(date) ?? [];
    const wins = items.filter(isWin).length;
    const losses = items.filter(isLoss).length;
    const breakeven = items.filter(isBreakeven).length;
    const netPnl = items.reduce((sum, trade) => sum + (typeof trade.netPnl === 'number' ? trade.netPnl : 0), 0);
    let outcome: CalendarDayOutcome = 'NO_TRADES';
    if (items.length > 0) {
      if (netPnl > 0) outcome = 'PROFIT';
      else if (netPnl < 0) outcome = 'LOSS';
      else outcome = 'BREAKEVEN';
    }
    days.push({
      date,
      trades: items.length,
      wins,
      losses,
      breakeven,
      netPnl: Math.round(netPnl * 100) / 100,
      outcome
    });
  }
  return days;
};
