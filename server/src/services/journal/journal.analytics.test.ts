import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  computeStreaks,
  groupByKey,
  monthlySeries,
  pnlSeries,
  summarizeClosedTrades,
  unspecified,
  type AnalyticsTrade
} from './journal.analytics.math';
import { buildOverview, buildReport } from './journal.analytics.service';
import { buildCalendarMonth } from './journal.calendar';
import { buildJournalListFilter } from './journal.query';

const trade = (partial: Partial<AnalyticsTrade> & Pick<AnalyticsTrade, 'id' | 'entryDate' | 'netPnl' | 'status'>): AnalyticsTrade => ({
  assetClass: 'equity',
  direction: 'LONG',
  ...partial
});

const fixtures: AnalyticsTrade[] = [
  trade({ id: '1', entryDate: '2026-08-01', status: 'CLOSED', netPnl: 100, returnPercent: 10, strategy: 'Breakout', setup: 'Gap Up', emotionBefore: 'Calm', followedPlan: true, mistakeTags: [] }),
  trade({ id: '2', entryDate: '2026-08-02', status: 'CLOSED', netPnl: -40, returnPercent: -4, strategy: 'Breakout', setup: 'Pullback', emotionBefore: 'FOMO', followedPlan: false, mistakeTags: ['FOMO'] }),
  trade({ id: '3', entryDate: '2026-08-03', status: 'CLOSED', netPnl: 0, returnPercent: 0, strategy: 'Momentum', setup: 'Breakout' }),
  trade({ id: '4', entryDate: '2026-08-04', status: 'OPEN', netPnl: null, strategy: 'Breakout' }),
  trade({ id: '5', entryDate: '2026-07-15', status: 'CLOSED', netPnl: 25, returnPercent: 5, strategy: 'Trend Following', assetClass: 'crypto' })
];

describe('journal analytics math', () => {
  it('computes win rate from decided closed trades only', () => {
    const summary = summarizeClosedTrades(fixtures);
    assert.equal(summary.wins, 2);
    assert.equal(summary.losses, 1);
    assert.equal(summary.breakeven, 1);
    assert.equal(summary.winRate, 66.67);
    assert.equal(summary.closedCount, 4);
  });

  it('ignores open trades in P&L and averages', () => {
    const summary = summarizeClosedTrades(fixtures);
    assert.equal(summary.netPnl, 85);
    assert.equal(summary.averageWin, 62.5);
    assert.equal(summary.averageLoss, -40);
    assert.equal(summary.bestTrade, 100);
    assert.equal(summary.worstTrade, -40);
  });

  it('returns null metrics on an empty dataset', () => {
    const summary = summarizeClosedTrades([]);
    assert.equal(summary.winRate, null);
    assert.equal(summary.netPnl, null);
    assert.equal(summary.profitFactor, null);
    assert.equal(summary.expectancy, null);
    assert.equal(summary.averageReturn, null);
  });

  it('does not treat breakeven as a win or loss streak', () => {
    const streaks = computeStreaks([
      trade({ id: 'a', entryDate: '2026-08-01', status: 'CLOSED', netPnl: 10 }),
      trade({ id: 'b', entryDate: '2026-08-02', status: 'CLOSED', netPnl: 0 }),
      trade({ id: 'c', entryDate: '2026-08-03', status: 'CLOSED', netPnl: 8 })
    ]);
    assert.equal(streaks.longestWinStreak, 1);
    assert.equal(streaks.currentWinStreak, 1);
    assert.equal(streaks.currentLossStreak, 0);
  });

  it('tracks current and longest win/loss streaks', () => {
    const streaks = computeStreaks([
      trade({ id: 'a', entryDate: '2026-08-01', status: 'CLOSED', netPnl: 10 }),
      trade({ id: 'b', entryDate: '2026-08-02', status: 'CLOSED', netPnl: 8 }),
      trade({ id: 'c', entryDate: '2026-08-03', status: 'CLOSED', netPnl: -3 }),
      trade({ id: 'd', entryDate: '2026-08-04', status: 'CLOSED', netPnl: -2 }),
      trade({ id: 'e', entryDate: '2026-08-05', status: 'CLOSED', netPnl: -1 })
    ]);
    assert.equal(streaks.longestWinStreak, 2);
    assert.equal(streaks.longestLossStreak, 3);
    assert.equal(streaks.currentLossStreak, 3);
    assert.equal(streaks.currentWinStreak, 0);
  });

  it('aggregates strategy performance without inventing rows', () => {
    const rows = groupByKey(fixtures, (item) => unspecified(item.strategy));
    const breakout = rows.find((row) => row.key === 'Breakout');
    assert.ok(breakout);
    assert.equal(breakout?.trades, 3);
    assert.equal(breakout?.wins, 1);
    assert.equal(breakout?.losses, 1);
    assert.equal(breakout?.netPnl, 60);
  });

  it('aggregates setup and asset class from actual values', () => {
    const setups = groupByKey(fixtures, (item) => unspecified(item.setup));
    const assets = groupByKey(fixtures, (item) => item.assetClass);
    assert.ok(setups.some((row) => row.key === 'Gap Up'));
    assert.ok(assets.some((row) => row.key === 'crypto' && row.wins === 1));
  });

  it('builds monthly P&L and a cumulative series', () => {
    const monthly = monthlySeries(fixtures);
    const series = pnlSeries(fixtures);
    assert.equal(monthly.find((row) => row.month === '2026-08')?.netPnl, 60);
    assert.equal(series.at(-1)?.cumulative, 85);
  });

  it('builds a daily calendar without filling empty days as profits', () => {
    const days = buildCalendarMonth(2026, 8, fixtures);
    assert.equal(days.length, 31);
    const first = days.find((day) => day.date === '2026-08-01');
    const empty = days.find((day) => day.date === '2026-08-10');
    const openOnly = days.find((day) => day.date === '2026-08-04');
    assert.equal(first?.outcome, 'PROFIT');
    assert.equal(first?.trades, 1);
    assert.equal(empty?.outcome, 'NO_TRADES');
    assert.equal(empty?.netPnl, 0);
    assert.equal(openOnly?.outcome, 'BREAKEVEN');
    assert.equal(openOnly?.trades, 1);
  });

  it('scopes analytics filters to the authenticated user', () => {
    const filter = buildJournalListFilter('507f1f77bcf86cd799439011', {
      from: '2026-08-01',
      to: '2026-08-31',
      assetClass: 'equity'
    });
    assert.equal(String(filter.userId), '507f1f77bcf86cd799439011');
    assert.equal(filter.assetClass, 'equity');
  });

  it('builds an empty overview without numeric defaults', () => {
    const overview = buildOverview([]);
    assert.equal(overview.empty, true);
    assert.equal(overview.totalTrades, 0);
    assert.equal(overview.winRate, null);
    assert.equal(overview.netPnl, null);
    assert.equal(overview.averageTrade, null);
    assert.equal(overview.bestTrade, null);
    assert.equal(overview.worstTrade, null);
  });

  it('keeps open trades out of overview P&L cards', () => {
    const overview = buildOverview(fixtures);
    assert.equal(overview.totalTrades, 5);
    assert.equal(overview.openTrades, 1);
    assert.equal(overview.winningTrades, 2);
    assert.equal(overview.losingTrades, 1);
    assert.equal(overview.netPnl, 85);
  });

  it('aggregates psychology without claiming causation', () => {
    const report = buildReport('psychology', fixtures);
    assert.equal(report.report, 'psychology');
    if (report.report !== 'psychology') return;
    const fomo = report.mistakes.find((row) => row.key === 'Tagged FOMO');
    const followed = report.plan.find((row) => row.key === 'Followed plan');
    const calm = report.emotions.find((row) => row.key === 'Calm');
    assert.ok(fomo);
    assert.equal(fomo?.trades, 1);
    assert.equal(fomo?.winRate, 0);
    assert.equal(fomo?.netPnl, -40);
    assert.equal(followed?.wins, 1);
    assert.equal(calm?.wins, 1);
  });

  it('lists every asset class and leaves unused classes without fake P&L', () => {
    const report = buildReport('assetClass', fixtures);
    if (report.report !== 'assetClass') return;
    assert.equal(report.rows.length, 11);
    const unused = report.rows.find((row) => row.key === 'forex');
    const crypto = report.rows.find((row) => row.key === 'crypto');
    assert.equal(unused?.trades, 0);
    assert.equal(unused?.winRate, null);
    assert.equal(unused?.netPnl, null);
    assert.equal(crypto?.wins, 1);
  });

  it('omits entry-hour analytics when fewer than five timed trades exist', () => {
    const report = buildReport('time', fixtures);
    if (report.report !== 'time') return;
    assert.equal(report.byHour, null);
    assert.ok(report.weekday.length > 0);
    assert.ok(report.month.length > 0);
  });

  it('counts missing stop, target, and plan fields in risk analytics', () => {
    const report = buildReport('risk', fixtures);
    if (report.report !== 'risk') return;
    assert.equal(report.tradesWithStopLoss, 0);
    assert.equal(report.missingStopLoss, 5);
    assert.equal(report.missingTarget, 5);
    assert.equal(report.averagePlannedRr, null);
    assert.equal(report.planFollowed, 1);
    assert.equal(report.planNotFollowed, 1);
    assert.equal(report.planUnspecified, 3);
  });

  it('applies date filters before strategy aggregation', () => {
    const august = fixtures.filter((item) => item.entryDate.startsWith('2026-08'));
    const report = buildReport('strategy', august);
    if (report.report !== 'strategy') return;
    assert.equal(report.rows.some((row) => row.key === 'Trend Following'), false);
    const breakout = report.rows.find((row) => row.key === 'Breakout');
    assert.equal(breakout?.trades, 3);
  });
});
