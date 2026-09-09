import { Types } from 'mongoose';
import { Activity } from '../models/Activity';
import { Watchlist, type IWatchlist, type IWatchlistItem } from '../models/Watchlist';
import type {
  AddWatchlistItemInput,
  CreateWatchlistInput,
  UpdateWatchlistInput,
  UpdateWatchlistItemInput,
  WatchlistMembershipQuery
} from '../validators/watchlist.validators';

type InstrumentIdentity = Pick<
  IWatchlistItem,
  'instrumentId' | 'instrumentKey' | 'symbol' | 'market' | 'exchange' | 'isin'
>;

export class WatchlistError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'WatchlistError';
  }
}

const normalizePart = (value?: string) => value?.trim().toUpperCase() ?? '';

const EXCHANGE_ALIASES: Record<string, string> = {
  NSE: 'NSE',
  'NATIONAL STOCK EXCHANGE': 'NSE',
  'NATIONAL STOCK EXCHANGE OF INDIA': 'NSE',
  BSE: 'BSE',
  'BOMBAY STOCK EXCHANGE': 'BSE',
  NASDAQ: 'NASDAQ',
  'NASDAQ NMS': 'NASDAQ',
  XNAS: 'NASDAQ',
  NYSE: 'NYSE',
  'NEW YORK STOCK EXCHANGE': 'NYSE',
  'NEW YORK STOCK EXCHANGE INC': 'NYSE'
};

const normalizeExchange = (value?: string) => {
  const cleaned = value?.trim().toUpperCase().replace(/[.,]/g, '').replace(/\s+/g, ' ') ?? '';
  if (!cleaned) return '';
  return EXCHANGE_ALIASES[cleaned] ?? cleaned;
};

const valuesCompatible = (left?: string, right?: string) => {
  if (!left || !right) return true;
  return left === right;
};

type MatchableInstrument = InstrumentIdentity & {
  identityKey?: string;
  instrumentKey?: string;
};

/**
 * Membership and duplicate checks prefer identityKey, then ISIN / instrument
 * identifiers, then symbol + market. Exchange aliases keep search results and
 * company profiles from looking like different listings of the same stock.
 */
export const instrumentsMatch = (left: MatchableInstrument, right: MatchableInstrument): boolean => {
  if (left.identityKey && right.identityKey && left.identityKey === right.identityKey) return true;

  const leftMarket = normalizePart(left.market);
  const rightMarket = normalizePart(right.market);
  if (!valuesCompatible(leftMarket, rightMarket)) return false;

  const leftIsin = normalizePart(left.isin);
  const rightIsin = normalizePart(right.isin);
  if (leftIsin && rightIsin && leftIsin === rightIsin) return true;

  const leftInstrumentId = normalizePart(left.instrumentId);
  const rightInstrumentId = normalizePart(right.instrumentId);
  if (leftInstrumentId && rightInstrumentId && leftInstrumentId === rightInstrumentId) return true;

  const leftInstrumentKey = normalizePart(left.instrumentKey);
  const rightInstrumentKey = normalizePart(right.instrumentKey);
  if (leftInstrumentKey && rightInstrumentKey && leftInstrumentKey === rightInstrumentKey) {
    return valuesCompatible(normalizeExchange(left.exchange), normalizeExchange(right.exchange));
  }

  return (
    Boolean(normalizePart(left.symbol)) &&
    normalizePart(left.symbol) === normalizePart(right.symbol) &&
    valuesCompatible(normalizeExchange(left.exchange), normalizeExchange(right.exchange))
  );
};

/**
 * The key uses the strongest stable identity available, while retaining market
 * and exchange context so identical symbols on different listings stay distinct.
 */
export const buildInstrumentIdentityKey = (instrument: InstrumentIdentity): string => {
  const context = `${normalizePart(instrument.market)}:${normalizePart(instrument.exchange)}`;
  if (instrument.isin) return `${context}:isin:${normalizePart(instrument.isin)}`;
  if (instrument.instrumentId) return `${context}:instrument:${normalizePart(instrument.instrumentId)}`;
  if (instrument.instrumentKey) return `${context}:provider:${normalizePart(instrument.instrumentKey)}`;
  return `${context}:symbol:${normalizePart(instrument.symbol)}`;
};

const requireObjectId = (value: string, label: string) => {
  if (!Types.ObjectId.isValid(value)) throw new WatchlistError(400, `Invalid ${label}.`);
  return new Types.ObjectId(value);
};

const scope = (userId: string, watchlistId: string) => ({
  _id: requireObjectId(watchlistId, 'watchlist id'),
  userId: requireObjectId(userId, 'user id')
});

const isDuplicateKeyError = (error: unknown) =>
  Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000);

const legacyItemId = (symbol: string) => `legacy-${encodeURIComponent(symbol.toUpperCase())}`;

const toIso = (value: Date | undefined) => value?.toISOString() ?? new Date(0).toISOString();

const toItemRecord = (item: IWatchlistItem, fallbackSortOrder?: number) => ({
  id: item._id?.toString() ?? legacyItemId(item.symbol),
  identityKey: item.identityKey,
  instrumentId: item.instrumentId,
  instrumentKey: item.instrumentKey,
  provider: item.provider,
  symbol: item.symbol,
  displaySymbol: item.displaySymbol,
  companyName: item.companyName,
  market: item.market,
  exchange: item.exchange,
  countryCode: item.countryCode,
  currency: item.currency,
  isin: item.isin,
  sortOrder: item.sortOrder ?? fallbackSortOrder ?? 0,
  addedAt: toIso(item.addedAt)
});

const toLegacyItemRecords = (watchlist: IWatchlist): ReturnType<typeof toItemRecord>[] =>
  (watchlist.symbols ?? []).map((symbol, index) => {
    const normalizedSymbol = symbol.toUpperCase();
    return {
      id: legacyItemId(normalizedSymbol),
      identityKey: buildInstrumentIdentityKey({ symbol: normalizedSymbol }),
      instrumentId: undefined,
      instrumentKey: undefined,
      provider: undefined,
      symbol: normalizedSymbol,
      displaySymbol: normalizedSymbol,
      companyName: normalizedSymbol,
      market: undefined,
      exchange: undefined,
      countryCode: undefined,
      currency: undefined,
      isin: undefined,
      sortOrder: index,
      addedAt: toIso(watchlist.createdAt)
    };
  });

const allItemRecords = (watchlist: IWatchlist) => [
  ...watchlist.items.map((item) => toItemRecord(item)),
  ...toLegacyItemRecords(watchlist)
].sort((left, right) => left.sortOrder - right.sortOrder || left.addedAt.localeCompare(right.addedAt));

const toWatchlistRecord = (watchlist: IWatchlist) => ({
  id: watchlist._id.toString(),
  name: watchlist.name || 'My Watchlist',
  description: watchlist.description ?? '',
  itemCount: watchlist.items.length + (watchlist.symbols?.length ?? 0),
  sortOrder: watchlist.sortOrder ?? 0,
  createdAt: toIso(watchlist.createdAt),
  updatedAt: toIso(watchlist.updatedAt)
});

const createActivity = (
  userId: string,
  title: string,
  description: string,
  company?: { symbol: string; name: string }
) => {
  void Activity.create({
    userId: new Types.ObjectId(userId),
    title,
    description,
    type: 'watchlist',
    companySymbol: company?.symbol,
    companyName: company?.name
  }).catch((error: unknown) => {
    console.error('Unable to record watchlist activity:', error instanceof Error ? error.message : error);
  });
};

export class WatchlistService {
  async createWatchlist(userId: string, input: CreateWatchlistInput) {
    const userObjectId = requireObjectId(userId, 'user id');
    const normalizedName = input.name.trim().toLowerCase();
    const duplicate = await Watchlist.findOne({ userId: userObjectId, normalizedName }).exec();
    if (duplicate) throw new WatchlistError(409, 'A watchlist with this name already exists.');

    try {
      const watchlist = await Watchlist.create({
        userId: userObjectId,
        name: input.name.trim(),
        normalizedName,
        description: input.description,
        sortOrder: input.sortOrder ?? 0,
        items: []
      });
      createActivity(userId, 'Watchlist created', `Created watchlist “${watchlist.name}”.`);
      return toWatchlistRecord(watchlist);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new WatchlistError(409, 'A watchlist with this name already exists.');
      }
      throw error;
    }
  }

  async listWatchlists(userId: string) {
    const userObjectId = requireObjectId(userId, 'user id');
    const watchlists = await Watchlist.find({ userId: userObjectId }).sort({ sortOrder: 1, createdAt: 1 }).exec();
    return { watchlists: watchlists.map(toWatchlistRecord) };
  }

  async getWatchlist(userId: string, watchlistId: string) {
    const watchlist = await Watchlist.findOne(scope(userId, watchlistId)).exec();
    if (!watchlist) throw new WatchlistError(404, 'Watchlist not found.');
    return watchlist;
  }

  async updateWatchlist(userId: string, watchlistId: string, input: UpdateWatchlistInput) {
    const watchlist = await this.getWatchlist(userId, watchlistId);
    const previousName = watchlist.name || 'My Watchlist';

    if (input.name !== undefined) {
      const normalizedName = input.name.trim().toLowerCase();
      const duplicate = await Watchlist.findOne({
        userId: watchlist.userId,
        normalizedName,
        _id: { $ne: watchlist._id }
      }).exec();
      if (duplicate) throw new WatchlistError(409, 'A watchlist with this name already exists.');
      watchlist.name = input.name.trim();
      watchlist.normalizedName = normalizedName;
    }
    if (input.description !== undefined) watchlist.description = input.description;
    if (input.sortOrder !== undefined) watchlist.sortOrder = input.sortOrder;

    try {
      await watchlist.save();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new WatchlistError(409, 'A watchlist with this name already exists.');
      }
      throw error;
    }

    if (input.name !== undefined && input.name.trim() !== previousName) {
      createActivity(userId, 'Watchlist renamed', `Renamed “${previousName}” to “${watchlist.name}”.`);
    }
    return toWatchlistRecord(watchlist);
  }

  async deleteWatchlist(userId: string, watchlistId: string) {
    const watchlist = await Watchlist.findOneAndDelete(scope(userId, watchlistId)).exec();
    if (!watchlist) throw new WatchlistError(404, 'Watchlist not found.');
    createActivity(userId, 'Watchlist deleted', `Deleted watchlist “${watchlist.name || 'My Watchlist'}”.`);
  }

  async listItems(userId: string, watchlistId: string) {
    const watchlist = await this.getWatchlist(userId, watchlistId);
    return {
      watchlist: {
        id: watchlist._id.toString(),
        name: watchlist.name || 'My Watchlist'
      },
      items: allItemRecords(watchlist)
    };
  }

  async addItem(userId: string, watchlistId: string, input: AddWatchlistItemInput) {
    const watchlist = await this.getWatchlist(userId, watchlistId);
    const identityKey = buildInstrumentIdentityKey(input);
    const existingItems = allItemRecords(watchlist);
    if (existingItems.some((item) => instrumentsMatch(item, { ...input, identityKey }))) {
      throw new WatchlistError(409, 'This instrument is already in the watchlist.');
    }

    const item = {
      ...input,
      identityKey,
      sortOrder: existingItems.length ? Math.max(...existingItems.map((entry) => entry.sortOrder)) + 1 : 0,
      addedAt: new Date()
    };
    const updated = await Watchlist.findOneAndUpdate(
      { ...scope(userId, watchlistId), 'items.identityKey': { $ne: identityKey } },
      { $push: { items: item } },
      { new: true }
    ).exec();

    if (!updated) {
      const current = await this.getWatchlist(userId, watchlistId);
      if (current.items.some((entry) => instrumentsMatch(entry, { ...input, identityKey }))) {
        throw new WatchlistError(409, 'This instrument is already in the watchlist.');
      }
      throw new WatchlistError(404, 'Watchlist not found.');
    }

    const added = updated.items.find((entry) => entry.identityKey === identityKey);
    if (!added) throw new WatchlistError(500, 'Unable to add the instrument.');
    createActivity(userId, 'Stock added to watchlist', `Added ${added.displaySymbol} to “${updated.name || 'My Watchlist'}”.`, {
      symbol: added.symbol,
      name: added.companyName
    });
    return toItemRecord(added);
  }

  async removeItem(userId: string, watchlistId: string, itemId: string) {
    const watchlist = await this.getWatchlist(userId, watchlistId);
    const modernItem = Types.ObjectId.isValid(itemId)
      ? watchlist.items.find((item) => item._id.toString() === itemId)
      : undefined;
    const legacySymbol = itemId.startsWith('legacy-')
      ? decodeURIComponent(itemId.slice('legacy-'.length)).toUpperCase()
      : undefined;
    const removed = modernItem ?? (legacySymbol ? toLegacyItemRecords(watchlist).find((item) => item.id === itemId) : undefined);
    if (!removed) throw new WatchlistError(404, 'Watchlist item not found.');

    const update = modernItem
      ? { $pull: { items: { _id: modernItem._id } } }
      : { $pull: { symbols: legacySymbol } };
    await Watchlist.updateOne(scope(userId, watchlistId), update).exec();
    createActivity(userId, 'Stock removed from watchlist', `Removed ${removed.displaySymbol} from “${watchlist.name || 'My Watchlist'}”.`, {
      symbol: removed.symbol,
      name: removed.companyName
    });
  }

  async findMemberships(userId: string, input: WatchlistMembershipQuery) {
    const userObjectId = requireObjectId(userId, 'user id');
    const identityKey = buildInstrumentIdentityKey(input);
    const target = { ...input, identityKey };
    const watchlists = await Watchlist.find({ userId: userObjectId })
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();

    return {
      memberships: watchlists.flatMap((watchlist) => {
        const match = allItemRecords(watchlist).find((item) => instrumentsMatch(item, target));
        if (!match) return [];
        return [
          {
            watchlistId: watchlist._id.toString(),
            watchlistName: watchlist.name || 'My Watchlist',
            itemId: match.id,
            identityKey: match.identityKey
          }
        ];
      })
    };
  }

  async updateItem(userId: string, watchlistId: string, itemId: string, input: UpdateWatchlistItemInput) {
    const itemObjectId = requireObjectId(itemId, 'watchlist item id');
    const updated = await Watchlist.findOneAndUpdate(
      { ...scope(userId, watchlistId), 'items._id': itemObjectId },
      { $set: { 'items.$.sortOrder': input.sortOrder } },
      { new: true }
    ).exec();
    if (!updated) {
      const watchlist = await this.getWatchlist(userId, watchlistId);
      if (!watchlist.items.some((item) => item._id.equals(itemObjectId))) {
        throw new WatchlistError(404, 'Watchlist item not found.');
      }
      throw new WatchlistError(500, 'Unable to update the watchlist item.');
    }
    const item = updated.items.find((entry) => entry._id.equals(itemObjectId));
    if (!item) throw new WatchlistError(500, 'Unable to update the watchlist item.');
    return toItemRecord(item);
  }
}

export const watchlistService = new WatchlistService();