import api from './api';
import type { SearchResult } from './stock.service';
import type {
  AddWatchlistItemInput,
  CreateWatchlistInput,
  UpdateWatchlistInput,
  WatchlistItem,
  WatchlistItemsResponse,
  WatchlistListResponse,
  WatchlistMembershipQuery,
  WatchlistMembershipResponse,
  WatchlistSummary
} from '../types/watchlist';

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (
      error as {
        response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
      }
    ).response;
    const firstField = response?.data?.errors?.find((item) => item.message)?.message;
    return firstField || response?.data?.message || fallback;
  }
  return fallback;
};

export const getWatchlistErrorMessage = errorMessage;

export const WATCHLIST_CACHE_KEYS = ['watchlists', 'watchlist-items', 'watchlist-membership'] as const;

export const invalidateWatchlistCaches = (queryClient: {
  invalidateQueries: (options: { queryKey: string[] }) => unknown;
}) => {
  WATCHLIST_CACHE_KEYS.forEach((key) => {
    void queryClient.invalidateQueries({ queryKey: [key] });
  });
  void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
};

export const toWatchlistItemInput = (result: SearchResult): AddWatchlistItemInput => ({
  symbol: result.symbol,
  displaySymbol: result.displaySymbol || result.symbol,
  companyName: result.companyName || result.description || result.symbol,
  market: result.market ?? undefined,
  exchange: result.exchangeCode || result.exchange || undefined,
  countryCode: result.countryCode ?? undefined,
  currency: result.currency ?? undefined,
  isin: result.isin ?? undefined,
  provider: result.provider,
  instrumentKey: result.providerInstrumentKey ?? undefined
});

export const fetchWatchlists = async (): Promise<WatchlistSummary[]> => {
  const response = await api.get<WatchlistListResponse>('/api/watchlists');
  return response.data.watchlists;
};

export const createWatchlist = async (input: CreateWatchlistInput): Promise<WatchlistSummary> => {
  const response = await api.post<WatchlistSummary>('/api/watchlists', input);
  return response.data;
};

export const updateWatchlist = async (
  watchlistId: string,
  input: UpdateWatchlistInput
): Promise<WatchlistSummary> => {
  const response = await api.patch<WatchlistSummary>(`/api/watchlists/${watchlistId}`, input);
  return response.data;
};

export const deleteWatchlist = async (watchlistId: string): Promise<void> => {
  await api.delete(`/api/watchlists/${watchlistId}`);
};

export const fetchWatchlistItems = async (watchlistId: string): Promise<WatchlistItemsResponse> => {
  const response = await api.get<WatchlistItemsResponse>(`/api/watchlists/${watchlistId}/items`);
  return response.data;
};

export const addWatchlistItem = async (
  watchlistId: string,
  input: AddWatchlistItemInput
): Promise<WatchlistItem> => {
  const response = await api.post<WatchlistItem>(`/api/watchlists/${watchlistId}/items`, input);
  return response.data;
};

export const removeWatchlistItem = async (watchlistId: string, itemId: string): Promise<void> => {
  await api.delete(`/api/watchlists/${watchlistId}/items/${itemId}`);
};

export const fetchWatchlistMembership = async (
  query: WatchlistMembershipQuery
): Promise<WatchlistMembershipResponse> => {
  const response = await api.get<WatchlistMembershipResponse>('/api/watchlists/membership', {
    params: {
      symbol: query.symbol,
      instrumentId: query.instrumentId,
      instrumentKey: query.instrumentKey,
      market: query.market ?? undefined,
      exchange: query.exchange,
      isin: query.isin
    }
  });
  return response.data;
};
