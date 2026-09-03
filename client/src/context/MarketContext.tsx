import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  CountryCode,
  CurrencyCode,
  MarketPreferences
} from '../config/markets';
import { MARKETS } from '../config/markets';
import MarketTransitionLoader from '../components/MarketTransitionLoader';
import {
  fetchMarketContext,
  updateMarketContext
} from '../services/market-context.service';
import { useAuth } from './AuthContext';

type MarketContextValue = MarketPreferences & {
  loading: boolean;
  error: string | null;
  setCountry: (country: CountryCode | null) => Promise<void>;
  setCurrency: (currency: CurrencyCode | null) => Promise<void>;
  refreshMarketContext: () => Promise<void>;
};

const EMPTY_PREFERENCES: MarketPreferences = {
  country: null,
  market: null,
  currency: null,
  currencyCustomized: false
};

const RELEVANT_QUERY_KEYS = new Set([
  'dashboard-summary',
  'stocks-search',
  'stock-profile',
  'stock-quote',
  'stock-news',
  'stock-recommendation',
  'stock-fundamentals',
  'stock-statements',
  'stock-shareholding',
  'stock-corporate-actions',
  'stock-competitors'
]);

const MarketContext = createContext<MarketContextValue | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<MarketPreferences>(EMPTY_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRelevantQueries = useCallback(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await queryClient.refetchQueries({
      type: 'active',
      predicate: (query) => RELEVANT_QUERY_KEYS.has(String(query.queryKey[0]))
    });
  }, [queryClient]);

  const refreshMarketContext = useCallback(async () => {
    if (!user) {
      setPreferences(EMPTY_PREFERENCES);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const context = await fetchMarketContext();
      setPreferences(context.preferences);
      await refreshRelevantQueries();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load market preferences.');
    } finally {
      setLoading(false);
    }
  }, [refreshRelevantQueries, user]);

  useEffect(() => {
    void refreshMarketContext();
  }, [refreshMarketContext]);

  const persistUpdate = useCallback(
    async (update: Partial<MarketPreferences>) => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        await queryClient.cancelQueries({
          predicate: (query) => RELEVANT_QUERY_KEYS.has(String(query.queryKey[0]))
        });
        const context = await updateMarketContext(update);
        setPreferences(context.preferences);
        await refreshRelevantQueries();
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : 'Unable to update market preferences.'
        );
      } finally {
        setLoading(false);
      }
    },
    [queryClient, refreshRelevantQueries, user]
  );

  const setCountry = useCallback(
    async (country: CountryCode | null) => {
      await persistUpdate({ country, market: country ? MARKETS[country].market : null });
    },
    [persistUpdate]
  );

  const setCurrency = useCallback(
    async (currency: CurrencyCode | null) => {
      await persistUpdate({ currency });
    },
    [persistUpdate]
  );

  const value = useMemo(
    () => ({
      ...preferences,
      loading,
      error,
      setCountry,
      setCurrency,
      refreshMarketContext
    }),
    [error, loading, preferences, refreshMarketContext, setCountry, setCurrency]
  );

  return (
    <MarketContext.Provider value={value}>
      {children}
      {loading ? <MarketTransitionLoader /> : null}
    </MarketContext.Provider>
  );
};

export const useMarketContext = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarketContext must be used inside MarketProvider');
  return context;
};
