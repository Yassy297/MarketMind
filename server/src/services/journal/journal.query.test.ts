import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildJournalListFilter, escapeRegex, normalizeJournalListQuery } from './journal.query';

describe('journal query helpers', () => {
  it('always scopes filters to the authenticated user', () => {
    const filter = buildJournalListFilter('507f1f77bcf86cd799439011', {
      search: 'hdfc',
      outcome: 'losing'
    });
    assert.equal(String(filter.userId), '507f1f77bcf86cd799439011');
    assert.deepEqual(filter.netPnl, { $lt: 0 });
    assert.ok(Array.isArray(filter.$or));
  });

  it('escapes regex metacharacters in search', () => {
    assert.equal(escapeRegex('AAPL.NS'), 'AAPL\\.NS');
  });

  it('caps pagination and defaults sort', () => {
    const query = normalizeJournalListQuery({ page: 0, limit: 999, sort: 'entryDate' });
    assert.equal(query.page, 1);
    assert.equal(query.limit, 50);
    assert.equal(query.sort, 'entryDate');
    assert.equal(query.order, -1);
    assert.equal(query.skip, 0);
  });

  it('applies date, tag, and direction filters', () => {
    const filter = buildJournalListFilter('507f1f77bcf86cd799439011', {
      from: '2026-08-01',
      to: '2026-08-31',
      tags: ['breakout'],
      direction: 'SHORT',
      status: 'CLOSED'
    });
    assert.equal(filter.direction, 'SHORT');
    assert.equal(filter.status, 'CLOSED');
    assert.deepEqual(filter.tags, { $all: ['breakout'] });
    assert.ok(filter.entryDate);
    const range = filter.entryDate as { $gte: Date; $lte: Date };
    assert.equal(range.$gte.toISOString(), '2026-08-01T00:00:00.000Z');
    assert.equal(range.$lte.toISOString(), '2026-08-31T23:59:59.999Z');
  });
});
