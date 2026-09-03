import { Types, type FilterQuery } from 'mongoose';
import type { JournalListQuery } from '../../types/journal';

const SORT_FIELDS = new Set(['entryDate', 'exitDate', 'netPnl', 'createdAt', 'symbol']);

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const normalizeJournalListQuery = (query: JournalListQuery) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const sort = SORT_FIELDS.has(query.sort ?? '') ? query.sort! : 'entryDate';
  const order = query.order === 'asc' ? 1 : -1;
  return { page, limit, skip: (page - 1) * limit, sort, order };
};

export const buildJournalListFilter = (
  userId: string,
  query: JournalListQuery
): FilterQuery<Record<string, unknown>> => {
  const filter: FilterQuery<Record<string, unknown>> = {
    userId: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId
  };
  if (query.assetClass) filter.assetClass = query.assetClass;
  if (query.market) filter.market = query.market;
  if (query.direction) filter.direction = query.direction;
  if (query.status) filter.status = query.status;
  if (query.strategy) filter.strategy = query.strategy;
  if (query.setup) filter.setup = query.setup;
  if (query.tags?.length) filter.tags = { $all: query.tags };
  if (query.outcome === 'profitable') filter.netPnl = { $gt: 0 };
  if (query.outcome === 'losing') filter.netPnl = { $lt: 0 };

  if (query.from || query.to) {
    filter.entryDate = {};
    if (query.from) (filter.entryDate as Record<string, Date>).$gte = new Date(query.from);
    if (query.to) {
      const inclusiveTo = query.to.includes('T') ? new Date(query.to) : new Date(`${query.to}T23:59:59.999Z`);
      (filter.entryDate as Record<string, Date>).$lte = inclusiveTo;
    }
  }

  const search = query.search?.trim();
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { symbol: pattern },
      { displaySymbol: pattern },
      { instrumentName: pattern },
      { strategy: pattern },
      { tags: pattern }
    ];
  }

  return filter;
};
