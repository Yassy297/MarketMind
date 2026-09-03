import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createJournalTradeSchema,
  journalAnalyticsQuerySchema,
  journalCalendarDayQuerySchema,
  journalCalendarQuerySchema,
  journalListQuerySchema
} from '../../validators/journal.validators';

const validTrade = {
  symbol: 'HDFCBANK.NS',
  displaySymbol: 'HDFCBANK',
  instrumentName: 'HDFC Bank Limited',
  assetClass: 'equity' as const,
  market: 'IN',
  currency: 'INR',
  direction: 'LONG' as const,
  status: 'OPEN' as const,
  entryPrice: 720,
  quantity: 10,
  entryDate: '2026-08-01'
};

describe('createJournalTradeSchema', () => {
  it('accepts a valid open trade', () => {
    const parsed = createJournalTradeSchema.safeParse(validTrade);
    assert.equal(parsed.success, true);
  });

  it('rejects negative prices and non-positive quantity', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      entryPrice: -1,
      quantity: 0
    });
    assert.equal(parsed.success, false);
  });

  it('requires exit fields when status is CLOSED', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      status: 'CLOSED'
    });
    assert.equal(parsed.success, false);
  });

  it('rejects an exit date before the entry date', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      status: 'CLOSED',
      exitPrice: 740,
      exitDate: '2026-07-01'
    });
    assert.equal(parsed.success, false);
  });

  it('rejects a missing instrument name', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      instrumentName: '   '
    });
    assert.equal(parsed.success, false);
  });

  it('rejects confidence outside 1-10', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      confidence: 11
    });
    assert.equal(parsed.success, false);
  });

  it('accepts predefined and custom strategy, setup, and market condition', () => {
    const predefined = createJournalTradeSchema.safeParse({
      ...validTrade,
      strategy: 'Trend Following',
      setup: 'Breakout',
      marketCondition: 'Strong Uptrend'
    });
    const custom = createJournalTradeSchema.safeParse({
      ...validTrade,
      strategy: 'Opening-range VWAP',
      setup: 'My gap fill',
      marketCondition: 'RBI policy day'
    });
    assert.equal(predefined.success, true);
    assert.equal(custom.success, true);
  });

  it('accepts historical free-text journal values', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      strategy: 'old free text strategy',
      setup: 'legacy setup note',
      marketCondition: 'choppy afternoon'
    });
    assert.equal(parsed.success, true);
  });

  it('accepts trade quality 1-5 and execution notes', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      tradeQuality: 4,
      executionNotes: 'Filled 2 ticks late'
    });
    assert.equal(parsed.success, true);
  });

  it('rejects invalid trade quality', () => {
    assert.equal(createJournalTradeSchema.safeParse({ ...validTrade, tradeQuality: 0 }).success, false);
    assert.equal(createJournalTradeSchema.safeParse({ ...validTrade, tradeQuality: 6 }).success, false);
    assert.equal(createJournalTradeSchema.safeParse({ ...validTrade, tradeQuality: 2.5 }).success, false);
  });

  it('rejects oversized execution notes', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      executionNotes: 'x'.repeat(2001)
    });
    assert.equal(parsed.success, false);
  });

  it('accepts a valid closed trade', () => {
    const parsed = createJournalTradeSchema.safeParse({
      ...validTrade,
      status: 'CLOSED',
      exitPrice: 740,
      exitDate: '2026-08-10',
      fees: 12
    });
    assert.equal(parsed.success, true);
  });
});

describe('journalListQuerySchema', () => {
  it('normalizes comma-separated tags and pagination', () => {
    const parsed = journalListQuerySchema.safeParse({
      tags: 'breakout,swing',
      page: '2',
      limit: '10',
      outcome: 'profitable'
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.deepEqual(parsed.data.tags, ['breakout', 'swing']);
      assert.equal(parsed.data.page, 2);
      assert.equal(parsed.data.limit, 10);
    }
  });
});

describe('journal analytics and calendar query schemas', () => {
  it('accepts a calendar month query', () => {
    const parsed = journalCalendarQuerySchema.safeParse({ year: '2026', month: '8' });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.year, 2026);
      assert.equal(parsed.data.month, 8);
    }
  });

  it('rejects an invalid calendar day', () => {
    const parsed = journalCalendarDayQuerySchema.safeParse({ date: '31-08-2026' });
    assert.equal(parsed.success, false);
  });

  it('accepts analytics filters for a named report', () => {
    const parsed = journalAnalyticsQuerySchema.safeParse({
      report: 'strategy',
      from: '2026-08-01',
      to: '2026-08-31',
      assetClass: 'equity',
      direction: 'LONG'
    });
    assert.equal(parsed.success, true);
  });
});
