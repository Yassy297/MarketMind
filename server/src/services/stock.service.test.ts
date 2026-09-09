import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Types } from 'mongoose';
import { RecentlyViewed } from '../models/RecentlyViewed';
import { deleteRecentlyViewed } from '../controllers/stock.controller';
import { RecentlyViewedError, stockService } from './stock.service';

const userId = '507f1f77bcf86cd799439011';

describe('Recently Viewed deletion', () => {
  it('deletes only the authenticated user’s matching stock', async () => {
    const original = RecentlyViewed.findOneAndDelete;
    let received: Record<string, unknown> | undefined;
    RecentlyViewed.findOneAndDelete = (async (filter: Record<string, unknown>) => {
      received = filter;
      return {};
    }) as typeof RecentlyViewed.findOneAndDelete;

    try {
      await stockService.deleteRecentlyViewed(userId, 'tsla');
      assert.ok(received?.user instanceof Types.ObjectId);
      assert.equal(String(received?.user), userId);
      assert.equal(received?.symbol, 'TSLA');
    } finally {
      RecentlyViewed.findOneAndDelete = original;
    }
  });

  it('returns not found when the user does not own the recently viewed stock', async () => {
    const original = RecentlyViewed.findOneAndDelete;
    RecentlyViewed.findOneAndDelete = (async () => null) as typeof RecentlyViewed.findOneAndDelete;

    try {
      await assert.rejects(
        () => stockService.deleteRecentlyViewed(userId, 'TSLA'),
        (error: unknown) => error instanceof RecentlyViewedError && error.status === 404
      );
    } finally {
      RecentlyViewed.findOneAndDelete = original;
    }
  });

  it('handles exchange-suffixed symbols without changing the record identity', async () => {
    const original = RecentlyViewed.findOneAndDelete;
    let received: Record<string, unknown> | undefined;
    RecentlyViewed.findOneAndDelete = (async (filter: Record<string, unknown>) => {
      received = filter;
      return {};
    }) as typeof RecentlyViewed.findOneAndDelete;

    try {
      await stockService.deleteRecentlyViewed(userId, 'HDFCBANK.NS');
      assert.equal(received?.symbol, 'HDFCBANK.NS');
    } finally {
      RecentlyViewed.findOneAndDelete = original;
    }
  });

  it('rejects an unauthenticated delete request', async () => {
    let statusCode = 0;
    const response = {
      status: (code: number) => {
        statusCode = code;
        return response;
      },
      json: () => response
    };

    await deleteRecentlyViewed({ params: { symbol: 'TSLA' } } as never, response as never);

    assert.equal(statusCode, 401);
  });
});