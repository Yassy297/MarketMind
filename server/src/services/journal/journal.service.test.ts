import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Types } from 'mongoose';
import { Activity } from '../../models/Activity';
import { JournalTrade } from '../../models/JournalTrade';
import type { JournalTradeInput } from '../../types/journal';
import { JournalError, journalService } from './journal.service';

const userId = '507f1f77bcf86cd799439011';
const tradeId = '507f191e810c19729de860ea';

const closedLong: JournalTradeInput = {
  symbol: 'AAPL',
  displaySymbol: 'AAPL',
  instrumentName: 'Apple Inc.',
  assetClass: 'equity',
  currency: 'USD',
  direction: 'LONG',
  status: 'CLOSED',
  entryPrice: 100,
  exitPrice: 110,
  quantity: 2,
  entryDate: '2026-08-01',
  exitDate: '2026-08-02',
  fees: 1
};

describe('JournalService', () => {
  it('rejects malformed trade ids', async () => {
    await assert.rejects(
      () => journalService.getById(userId, 'not-valid'),
      (error: unknown) => error instanceof JournalError && error.status === 400
    );
  });

  it('scopes getById to the authenticated user', async () => {
    let received: Record<string, unknown> | undefined;
    const original = JournalTrade.findOne;
    JournalTrade.findOne = ((filter: Record<string, unknown>) => {
      received = filter;
      return Promise.resolve(null);
    }) as typeof JournalTrade.findOne;

    try {
      await assert.rejects(
        () => journalService.getById(userId, tradeId),
        (error: unknown) => error instanceof JournalError && error.status === 404
      );
      assert.equal(String(received?._id), tradeId);
      assert.ok(received?.userId instanceof Types.ObjectId);
      assert.equal(String(received?.userId), userId);
    } finally {
      JournalTrade.findOne = original;
    }
  });

  it('creates a trade with server-calculated P&L', async () => {
    const original = JournalTrade.create;
    const originalActivityCreate = Activity.create;
    let activity: Record<string, unknown> | undefined;
    JournalTrade.create = (async (doc: Record<string, unknown>) => ({
      ...doc,
      id: tradeId,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z')
    })) as typeof JournalTrade.create;
    Activity.create = (async (doc: Record<string, unknown>) => {
      activity = doc;
      return undefined;
    }) as typeof Activity.create;

    try {
      const trade = await journalService.create(userId, closedLong);
      assert.equal(trade.id, tradeId);
      assert.equal(trade.grossPnl, 20);
      assert.equal(trade.netPnl, 19);
      assert.equal(trade.returnPercent, 9.5);
      assert.equal(trade.currency, 'USD');
      assert.equal(activity?.title, 'Trade added');
      assert.equal(activity?.description, 'Added AAPL trade to Journal');
      assert.equal(activity?.type, 'journal');
      assert.equal(String(activity?.userId), userId);
    } finally {
      JournalTrade.create = original;
      Activity.create = originalActivityCreate;
    }
  });

  it('paginates list results and keeps the user scope', async () => {
    let received: Record<string, unknown> | undefined;
    const originalFind = JournalTrade.find;
    const originalCount = JournalTrade.countDocuments;
    JournalTrade.find = ((filter: Record<string, unknown>) => {
      received = filter;
      return {
        sort() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return this;
        },
        exec: async () => []
      };
    }) as typeof JournalTrade.find;
    JournalTrade.countDocuments = (async () => 25) as typeof JournalTrade.countDocuments;

    try {
      const result = await journalService.list(userId, { page: 2, limit: 10, assetClass: 'equity' });
      assert.equal(result.page, 2);
      assert.equal(result.limit, 10);
      assert.equal(result.total, 25);
      assert.equal(result.totalPages, 3);
      assert.equal(String(received?.userId), userId);
      assert.equal(received?.assetClass, 'equity');
    } finally {
      JournalTrade.find = originalFind;
      JournalTrade.countDocuments = originalCount;
    }
  });

  it('recalculates P&L on a user-scoped update', async () => {
    const existing = {
      id: tradeId,
      instrumentId: undefined,
      symbol: 'AAPL',
      displaySymbol: 'AAPL',
      instrumentName: 'Apple Inc.',
      assetClass: 'equity',
      market: undefined,
      exchange: undefined,
      currency: 'USD',
      direction: 'LONG',
      status: 'CLOSED',
      entryPrice: 100,
      exitPrice: 110,
      quantity: 2,
      entryDate: new Date('2026-08-01'),
      entryTime: undefined,
      exitDate: new Date('2026-08-02'),
      exitTime: undefined,
      fees: 1,
      stopLoss: undefined,
      target: undefined,
      thesis: undefined,
      entryReason: undefined,
      exitReason: undefined,
      strategy: undefined,
      setup: undefined,
      marketCondition: undefined,
      confidence: undefined,
      emotionBefore: undefined,
      emotionAfter: undefined,
      followedPlan: undefined,
      mistakeTags: [],
      lessonLearned: undefined,
      whatWentRight: undefined,
      whatWentWrong: undefined,
      whatWouldDoDifferently: undefined,
      notes: undefined,
      tags: [],
      attachments: [],
      assetDetails: {},
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      set(values: Record<string, unknown>) {
        Object.assign(this, values);
      },
      async save() {
        return this;
      }
    };
    const original = JournalTrade.findOne;
    const originalActivityCreate = Activity.create;
    let activity: Record<string, unknown> | undefined;
    JournalTrade.findOne = (async () => existing) as typeof JournalTrade.findOne;
    Activity.create = (async (doc: Record<string, unknown>) => {
      activity = doc;
      return undefined;
    }) as typeof Activity.create;

    try {
      const trade = await journalService.update(userId, tradeId, { exitPrice: 120 });
      assert.equal(trade.grossPnl, 40);
      assert.equal(trade.netPnl, 39);
      assert.equal(activity?.title, 'Trade updated');
      assert.equal(activity?.description, 'Updated AAPL trade in Journal');
    } finally {
      JournalTrade.findOne = original;
      Activity.create = originalActivityCreate;
    }
  });

  it('does not delete another user\'s trade', async () => {
    let received: Record<string, unknown> | undefined;
    const original = JournalTrade.findOneAndDelete;
    JournalTrade.findOneAndDelete = (async (filter: Record<string, unknown>) => {
      received = filter;
      return null;
    }) as typeof JournalTrade.findOneAndDelete;

    try {
      await assert.rejects(
        () => journalService.remove(userId, tradeId),
        (error: unknown) => error instanceof JournalError && error.status === 404
      );
      assert.equal(String(received?._id), tradeId);
      assert.equal(String(received?.userId), userId);
    } finally {
      JournalTrade.findOneAndDelete = original;
    }
  });

  it('records delete activity using the trade snapshot before removal', async () => {
    const original = JournalTrade.findOneAndDelete;
    const originalActivityCreate = Activity.create;
    let activity: Record<string, unknown> | undefined;
    JournalTrade.findOneAndDelete = (async () => ({
      symbol: 'HDFCBANK.NS',
      displaySymbol: 'HDFCBANK.NS',
      instrumentName: 'HDFC Bank'
    })) as typeof JournalTrade.findOneAndDelete;
    Activity.create = (async (doc: Record<string, unknown>) => {
      activity = doc;
      return undefined;
    }) as typeof Activity.create;

    try {
      await journalService.remove(userId, tradeId);
      assert.equal(activity?.title, 'Trade deleted');
      assert.equal(activity?.description, 'Deleted HDFCBANK.NS trade from Journal');
      assert.equal(activity?.companySymbol, 'HDFCBANK.NS');
      assert.equal(activity?.companyName, 'HDFC Bank');
    } finally {
      JournalTrade.findOneAndDelete = original;
      Activity.create = originalActivityCreate;
    }
  });

  it('does not create activity when journal CRUD fails', async () => {
    const originalCreate = JournalTrade.create;
    const originalFind = JournalTrade.findOne;
    const originalDelete = JournalTrade.findOneAndDelete;
    const originalActivityCreate = Activity.create;
    let activityCount = 0;
    JournalTrade.create = (async () => {
      throw new Error('create failed');
    }) as typeof JournalTrade.create;
    JournalTrade.findOne = (async () => null) as typeof JournalTrade.findOne;
    JournalTrade.findOneAndDelete = (async () => null) as typeof JournalTrade.findOneAndDelete;
    Activity.create = (async () => {
      activityCount += 1;
      return undefined;
    }) as typeof Activity.create;

    try {
      await assert.rejects(() => journalService.create(userId, closedLong));
      await assert.rejects(() => journalService.update(userId, tradeId, { notes: 'changed' }));
      await assert.rejects(() => journalService.remove(userId, tradeId));
      assert.equal(activityCount, 0);
    } finally {
      JournalTrade.create = originalCreate;
      JournalTrade.findOne = originalFind;
      JournalTrade.findOneAndDelete = originalDelete;
      Activity.create = originalActivityCreate;
    }
  });

  it('does not fail journal CRUD when activity logging fails', async () => {
    const original = JournalTrade.create;
    const originalActivityCreate = Activity.create;
    JournalTrade.create = (async (doc: Record<string, unknown>) => ({
      ...doc,
      id: tradeId,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z')
    })) as typeof JournalTrade.create;
    Activity.create = (async () => {
      throw new Error('activity unavailable');
    }) as typeof Activity.create;

    try {
      const trade = await journalService.create(userId, closedLong);
      assert.equal(trade.id, tradeId);
    } finally {
      JournalTrade.create = original;
      Activity.create = originalActivityCreate;
    }
  });
});
