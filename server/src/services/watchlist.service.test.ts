import assert from 'node:assert/strict';
import { describe, it, mock, afterEach } from 'node:test';
import { Types } from 'mongoose';
import { Activity } from '../models/Activity';
import { Watchlist } from '../models/Watchlist';
import { listWatchlists } from '../controllers/watchlist.controller';
import {
  addWatchlistItemSchema,
  createWatchlistSchema,
  updateWatchlistSchema
} from '../validators/watchlist.validators';
import {
  buildInstrumentIdentityKey,
  WatchlistError,
  WatchlistService
} from './watchlist.service';

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const watchlistId = '507f1f77bcf86cd799439013';
const itemId = new Types.ObjectId('507f1f77bcf86cd799439014');

const query = <T>(value: T) => ({ exec: async () => value });

const watchlistDocument = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: new Types.ObjectId(watchlistId),
    userId: new Types.ObjectId(userId),
    name: 'Long Term',
    normalizedName: 'long term',
    description: '',
    sortOrder: 0,
    items: [],
    createdAt: new Date('2026-09-04T00:00:00.000Z'),
    updatedAt: new Date('2026-09-04T00:00:00.000Z'),
    save: async function () {
      return this;
    },
    ...overrides
  }) as never;

afterEach(() => {
  mock.restoreAll();
});

describe('watchlist identity', () => {
  it('distinguishes identical symbols in different markets or exchanges', () => {
    const nse = buildInstrumentIdentityKey({ symbol: 'TSLA', market: 'IN', exchange: 'NSE' });
    const bse = buildInstrumentIdentityKey({ symbol: 'TSLA', market: 'IN', exchange: 'BSE' });
    const us = buildInstrumentIdentityKey({ symbol: 'TSLA', market: 'US', exchange: 'NASDAQ' });

    assert.notEqual(nse, bse);
    assert.notEqual(nse, us);
  });

  it('uses a stable instrument identity when an ISIN is available', () => {
    assert.equal(
      buildInstrumentIdentityKey({
        symbol: 'HDFCBANK',
        market: 'IN',
        exchange: 'NSE',
        isin: 'ine040a01034'
      }),
      'IN:NSE:isin:INE040A01034'
    );
  });
});

describe('watchlist validation', () => {
  it('rejects empty names and malformed instrument payloads', () => {
    assert.equal(createWatchlistSchema.safeParse({ name: '   ' }).success, false);
    assert.equal(
      addWatchlistItemSchema.safeParse({
        symbol: '',
        displaySymbol: 'TSLA',
        companyName: 'Tesla'
      }).success,
      false
    );
  });

  it('trims and normalizes valid input', () => {
    const result = addWatchlistItemSchema.parse({
      symbol: ' hdfcbank.ns ',
      displaySymbol: ' HDFCBANK ',
      companyName: ' HDFC Bank ',
      market: 'in',
      exchange: ' NSE '
    });

    assert.equal(result.symbol, 'HDFCBANK.NS');
    assert.equal(result.displaySymbol, 'HDFCBANK');
    assert.equal(result.market, 'IN');
    assert.equal(result.exchange, 'NSE');
  });

  it('allows a description to be cleared during an update', () => {
    const result = updateWatchlistSchema.parse({ description: '' });
    assert.equal(result.description, '');
  });
});

describe('watchlist service ownership and CRUD', () => {
  it('rejects an unauthenticated watchlist request', async () => {
    let statusCode = 0;
    const response = {
      status: (code: number) => {
        statusCode = code;
        return response;
      },
      json: () => response
    };

    await listWatchlists({} as never, response as never);

    assert.equal(statusCode, 401);
  });

  it('scopes list queries to the authenticated user', async () => {
    let receivedFilter: Record<string, unknown> | undefined;
    mock.method(Watchlist, 'find', (filter: Record<string, unknown>) => {
      receivedFilter = filter;
      return {
        sort: () => query([watchlistDocument()])
      } as never;
    });

    const result = await new WatchlistService().listWatchlists(userId);

    assert.equal(String(receivedFilter?.userId), userId);
    assert.equal(result.watchlists[0]?.name, 'Long Term');
  });

  it('does not expose another user’s watchlist through a scoped lookup', async () => {
    let receivedFilter: Record<string, unknown> | undefined;
    mock.method(Watchlist, 'findOne', (filter: Record<string, unknown>) => {
      receivedFilter = filter;
      return query(null);
    });

    await assert.rejects(
      () => new WatchlistService().getWatchlist(otherUserId, watchlistId),
      (error: unknown) => error instanceof WatchlistError && error.status === 404
    );
    assert.equal(String(receivedFilter?.userId), otherUserId);
    assert.equal(String(receivedFilter?._id), watchlistId);
  });

  it('creates a watchlist with the authenticated user as owner', async () => {
    let created: Record<string, unknown> | undefined;
    mock.method(Watchlist, 'findOne', () => query(null));
    mock.method(Watchlist, 'create', (value: Record<string, unknown>) => {
      created = value;
      return Promise.resolve(watchlistDocument(value));
    });
    mock.method(Activity, 'create', () => Promise.resolve());

    const result = await new WatchlistService().createWatchlist(userId, { name: ' Long Term ' });

    assert.equal(String(created?.userId), userId);
    assert.equal(created?.name, 'Long Term');
    assert.equal(result.name, 'Long Term');
  });

  it('rejects duplicate watchlist names for one user', async () => {
    mock.method(Watchlist, 'findOne', () => query(watchlistDocument()));

    await assert.rejects(
      () => new WatchlistService().createWatchlist(userId, { name: 'Long Term' }),
      (error: unknown) => error instanceof WatchlistError && error.status === 409
    );
  });

  it('updates a user-owned watchlist and can clear its description', async () => {
    let saved = false;
    const existing = watchlistDocument({
      description: 'Old description',
      save: async function () {
        saved = true;
        return this;
      }
    });
    mock.method(Watchlist, 'findOne', (filter: Record<string, unknown>) =>
      query(String(filter.normalizedName ?? '') === 'new name' ? null : existing)
    );
    mock.method(Activity, 'create', () => Promise.resolve());

    const result = await new WatchlistService().updateWatchlist(userId, watchlistId, {
      name: ' New Name ',
      description: '',
      sortOrder: 2
    });

    assert.equal(saved, true);
    assert.equal(existing.name, 'New Name');
    assert.equal(existing.description, '');
    assert.equal(existing.sortOrder, 2);
    assert.equal(result.name, 'New Name');
  });

  it('deletes only the authenticated user’s watchlist', async () => {
    let receivedFilter: Record<string, unknown> | undefined;
    mock.method(Watchlist, 'findOneAndDelete', (filter: Record<string, unknown>) => {
      receivedFilter = filter;
      return query(watchlistDocument());
    });
    mock.method(Activity, 'create', () => Promise.resolve());

    await new WatchlistService().deleteWatchlist(userId, watchlistId);

    assert.equal(String(receivedFilter?.userId), userId);
    assert.equal(String(receivedFilter?._id), watchlistId);
  });

  it('lists canonical instruments in stable order', async () => {
    const items = [
      {
        _id: itemId,
        identityKey: 'US:NASDAQ:symbol:TSLA',
        symbol: 'TSLA',
        displaySymbol: 'TSLA',
        companyName: 'Tesla',
        market: 'US',
        exchange: 'NASDAQ',
        sortOrder: 1,
        addedAt: new Date('2026-09-04T00:00:00.000Z')
      }
    ];
    mock.method(Watchlist, 'findOne', () => query(watchlistDocument({ items })));

    const result = await new WatchlistService().listItems(userId, watchlistId);

    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.id, itemId.toString());
    assert.equal(result.items[0]?.displaySymbol, 'TSLA');
  });

  it('adds an item with an atomic identity predicate and appends it', async () => {
    let receivedFilter: Record<string, unknown> | undefined;
    const addedItem = {
      _id: itemId,
      identityKey: 'US:NASDAQ:symbol:AAPL',
      symbol: 'AAPL',
      displaySymbol: 'AAPL',
      companyName: 'Apple',
      market: 'US',
      exchange: 'NASDAQ',
      sortOrder: 0,
      addedAt: new Date('2026-09-04T00:00:00.000Z')
    };
    mock.method(Watchlist, 'findOne', () => query(watchlistDocument()));
    mock.method(Watchlist, 'findOneAndUpdate', (filter: Record<string, unknown>) => {
      receivedFilter = filter;
      return query(watchlistDocument({ items: [addedItem] }));
    });
    mock.method(Activity, 'create', () => Promise.resolve());

    const result = await new WatchlistService().addItem(userId, watchlistId, {
      symbol: 'AAPL',
      displaySymbol: 'AAPL',
      companyName: 'Apple',
      market: 'US',
      exchange: 'NASDAQ'
    });

    assert.deepEqual(receivedFilter?.['items.identityKey'], { $ne: 'US:NASDAQ:symbol:AAPL' });
    assert.equal(result.id, itemId.toString());
  });

  it('atomically rejects an item already present in the scoped watchlist', async () => {
    const item = {
      _id: itemId,
      identityKey: 'US:NASDAQ:symbol:TSLA',
      symbol: 'TSLA',
      displaySymbol: 'TSLA',
      companyName: 'Tesla',
      market: 'US',
      exchange: 'NASDAQ',
      sortOrder: 0,
      addedAt: new Date()
    };
    mock.method(Watchlist, 'findOne', () => query(watchlistDocument({ items: [item] })));

    await assert.rejects(
      () =>
        new WatchlistService().addItem(userId, watchlistId, {
          symbol: 'TSLA',
          displaySymbol: 'TSLA',
          companyName: 'Tesla',
          market: 'US',
          exchange: 'NASDAQ'
        }),
      (error: unknown) => error instanceof WatchlistError && error.status === 409
    );
  });

  it('removes a user-owned item', async () => {
    let receivedUpdate: Record<string, unknown> | undefined;
    const item = {
      _id: itemId,
      identityKey: 'US:NASDAQ:symbol:TSLA',
      symbol: 'TSLA',
      displaySymbol: 'TSLA',
      companyName: 'Tesla',
      market: 'US',
      exchange: 'NASDAQ',
      sortOrder: 0,
      addedAt: new Date()
    };
    mock.method(Watchlist, 'findOne', () => query(watchlistDocument({ items: [item] })));
    mock.method(Watchlist, 'updateOne', (_filter: Record<string, unknown>, update: Record<string, unknown>) => {
      receivedUpdate = update;
      return query({ acknowledged: true, modifiedCount: 1 });
    });
    mock.method(Activity, 'create', () => Promise.resolve());

    await new WatchlistService().removeItem(userId, watchlistId, itemId.toString());

    assert.deepEqual(receivedUpdate, { $pull: { items: { _id: itemId } } });
  });

  it('reorders an item only inside the authenticated user’s watchlist', async () => {
    let receivedFilter: Record<string, unknown> | undefined;
    const item = {
      _id: itemId,
      identityKey: 'US:NASDAQ:symbol:TSLA',
      symbol: 'TSLA',
      displaySymbol: 'TSLA',
      companyName: 'Tesla',
      market: 'US',
      exchange: 'NASDAQ',
      sortOrder: 3,
      addedAt: new Date()
    };
    mock.method(Watchlist, 'findOneAndUpdate', (filter: Record<string, unknown>) => {
      receivedFilter = filter;
      return query(watchlistDocument({ items: [item] }));
    });

    const result = await new WatchlistService().updateItem(userId, watchlistId, itemId.toString(), {
      sortOrder: 3
    });

    assert.equal(String(receivedFilter?.userId), userId);
    assert.equal(result.sortOrder, 3);
  });

  it('allows the same instrument in separate watchlists', () => {
    const identity = buildInstrumentIdentityKey({ symbol: 'AAPL', market: 'US', exchange: 'NASDAQ' });
    assert.equal(identity, buildInstrumentIdentityKey({ symbol: 'AAPL', market: 'US', exchange: 'NASDAQ' }));
    assert.notEqual(identity, buildInstrumentIdentityKey({ symbol: 'AAPL', market: 'US', exchange: 'NYSE' }));
  });
});