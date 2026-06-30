import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import StockSearch from '../components/stock/StockSearch';
import StockCard from '../components/stock/StockCard';
import StockHeader from '../components/stock/StockHeader';
import FinancialCard from '../components/stock/FinancialCard';
import NewsCard from '../components/stock/NewsCard';
import RecommendationCard from '../components/stock/RecommendationCard';
import {
  fetchRecentlyViewed,
  fetchRecommendation,
  fetchStockNews,
  fetchStockProfile,
  fetchStockQuote,
  searchStocks
} from '../services/stock.service';

const Stocks: React.FC = () => {
  const [query, setQuery] = useState('TSLA');
  const [selectedSymbol, setSelectedSymbol] = useState('TSLA');

  const searchQuery = useQuery({
    queryKey: ['stocks-search', query],
    queryFn: () => searchStocks(query),
    enabled: query.trim().length > 0,
    retry: false
  });

  const profileQuery = useQuery({
    queryKey: ['stock-profile', selectedSymbol],
    queryFn: () => fetchStockProfile(selectedSymbol),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const quoteQuery = useQuery({
    queryKey: ['stock-quote', selectedSymbol],
    queryFn: () => fetchStockQuote(selectedSymbol),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const newsQuery = useQuery({
    queryKey: ['stock-news', selectedSymbol],
    queryFn: () => fetchStockNews(selectedSymbol),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const recommendationQuery = useQuery({
    queryKey: ['stock-recommendation', selectedSymbol],
    queryFn: () => fetchRecommendation(selectedSymbol),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const recentlyViewedQuery = useQuery({
    queryKey: ['recently-viewed'],
    queryFn: fetchRecentlyViewed,
    retry: false
  });

  const financialMetrics = useMemo(() => {
    const quote = quoteQuery.data;
    const profile = profileQuery.data;
    return [
      { label: 'Current Price', value: quote ? `$${quote.currentPrice.toFixed(2)}` : '—' },
      { label: 'Day Change', value: quote ? `${quote.change.toFixed(2)} (${quote.percentChange.toFixed(1)}%)` : '—' },
      { label: 'Market Cap', value: profile ? `$${(profile.marketCapitalization / 1e9).toFixed(1)}B` : '—' },
      { label: 'Currency', value: profile?.currency ?? '—' }
    ];
  }, [profileQuery.data, quoteQuery.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Intelligence" />

      <StockSearch
        query={query}
        onQueryChange={setQuery}
        onSubmit={() => setSelectedSymbol(query.trim().toUpperCase() || 'TSLA')}
        loading={searchQuery.isFetching}
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <StockHeader
            symbol={selectedSymbol}
            name={profileQuery.data?.name ?? selectedSymbol}
            exchange={profileQuery.data?.exchange ?? 'NASDAQ'}
            loading={profileQuery.isLoading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {financialMetrics.map((metric) => (
              <FinancialCard key={metric.label} label={metric.label} value={metric.value} loading={profileQuery.isLoading || quoteQuery.isLoading} />
            ))}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Latest news</h3>
              <span className="text-sm text-gray-500">Finnhub feed</span>
            </div>
            {newsQuery.isLoading && (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded bg-gray-800" />
                <div className="h-20 animate-pulse rounded bg-gray-800" />
              </div>
            )}
            {newsQuery.isError && !newsQuery.isLoading && (
              <div className="rounded border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">Unable to load the latest news.</div>
            )}
            {!newsQuery.isLoading && !newsQuery.isError && (
              <div className="grid gap-3">
                {(newsQuery.data ?? []).map((item) => (
                  <NewsCard
                    key={item.id}
                    headline={item.headline}
                    summary={item.summary}
                    source={item.source}
                    datetime={new Date(item.datetime * 1000).toLocaleString()}
                    url={item.url}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Search results</h3>
              <span className="text-sm text-gray-500">Autocomplete</span>
            </div>
            {searchQuery.isLoading && (
              <div className="space-y-2">
                <div className="h-16 animate-pulse rounded bg-gray-800" />
                <div className="h-16 animate-pulse rounded bg-gray-800" />
              </div>
            )}
            {searchQuery.isError && !searchQuery.isLoading && (
              <div className="rounded border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">Unable to search stocks.</div>
            )}
            {!searchQuery.isLoading && !searchQuery.isError && (
              <div className="space-y-2">
                {(searchQuery.data ?? []).slice(0, 6).map((item) => (
                  <StockCard key={item.symbol} symbol={item.symbol} description={item.description} onSelect={setSelectedSymbol} />
                ))}
              </div>
            )}
          </div>

          <RecommendationCard
            buy={recommendationQuery.data?.buy ?? 0}
            hold={recommendationQuery.data?.hold ?? 0}
            sell={recommendationQuery.data?.sell ?? 0}
            period={recommendationQuery.data?.period ?? 'N/A'}
            loading={recommendationQuery.isLoading}
          />

          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Recently viewed</h3>
              <span className="text-sm text-gray-500">Your last 5</span>
            </div>
            {recentlyViewedQuery.isLoading && (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded bg-gray-800" />
                <div className="h-10 animate-pulse rounded bg-gray-800" />
              </div>
            )}
            {recentlyViewedQuery.isError && !recentlyViewedQuery.isLoading && (
              <div className="rounded border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">Unable to load recently viewed companies.</div>
            )}
            {!recentlyViewedQuery.isLoading && !recentlyViewedQuery.isError && (
              <div className="space-y-2">
                {(recentlyViewedQuery.data ?? []).map((item) => (
                  <div key={`${item.symbol}-${item.viewedAt}`} className="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                    <div className="font-medium text-white">{item.symbol}</div>
                    <div className="text-sm text-gray-400">{item.company}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stocks;
