import type { CountryCode, CurrencyCode, MarketCode } from '../config/markets';

export type WatchlistSummary = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type WatchlistItem = {
  id: string;
  identityKey: string;
  instrumentId?: string;
  instrumentKey?: string;
  provider?: 'finnhub' | 'upstox' | 'twelveData';
  symbol: string;
  displaySymbol: string;
  companyName: string;
  market?: MarketCode;
  exchange?: string;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
  isin?: string;
  sortOrder: number;
  addedAt: string;
};

export type WatchlistListResponse = {
  watchlists: WatchlistSummary[];
};

export type WatchlistItemsResponse = {
  watchlist: {
    id: string;
    name: string;
  };
  items: WatchlistItem[];
};

export type WatchlistMembership = {
  watchlistId: string;
  watchlistName: string;
  itemId: string;
  identityKey: string;
};

export type WatchlistMembershipResponse = {
  memberships: WatchlistMembership[];
};

export type CreateWatchlistInput = {
  name: string;
  description?: string;
};

export type UpdateWatchlistInput = {
  name?: string;
  description?: string;
};

export type AddWatchlistItemInput = {
  instrumentId?: string;
  instrumentKey?: string;
  provider?: 'finnhub' | 'upstox' | 'twelveData';
  symbol: string;
  displaySymbol: string;
  companyName: string;
  market?: MarketCode;
  exchange?: string;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
  isin?: string;
};

export type WatchlistMembershipQuery = {
  symbol: string;
  instrumentId?: string;
  instrumentKey?: string;
  market?: MarketCode | null;
  exchange?: string;
  isin?: string;
};
