import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from 'lucide-react';
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
      { label: 'Current Price', value: quote ? `$${quote.currentPrice.toFixed(2)}` : '-' },
      { label: 'Day Change', value: quote ? `${quote.change.toFixed(2)} (${quote.percentChange.toFixed(1)}%)` : '-' },
      { label: 'Market Cap', value: profile?.marketCapitalization ? `$${(profile.marketCapitalization / 1e3).toFixed(1)}B` : '-' },
      { label: 'Currency', value: profile?.currency ?? '-' }
    ];
  }, [profileQuery.data, quoteQuery.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Intelligence" subtitle="Search and analyze stocks with live market data." />

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

          <div className="rounded-2xl border border-white/6 bg-ink-900/80 p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <Newspaper className="h-4 w-4 text-slate-500" />
                Latest news
              </h3>
              <span className="text-xs uppercase tracking-wider text-slate-500">Finnhub feed</span>
            </div>
            {newsQuery.isLoading && (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-lg bg-white/5" />
                <div className="h-20 animate-pulse rounded-lg bg-white/5" />
              </div>
            )}
            {newsQuery.isError && !newsQuery.isLoading && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">Unable to load the latest news.</div>
            )}
            {!newsQuery.isLoading && !newsQuery.isError && (
              <div className="grid gap-3">
                {(newsQuery.data ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">No recent news for this symbol.</div>
                ) : (
                  (newsQuery.data ?? []).map((item) => (
                    <NewsCard
                      key={item.id}
                      headline={item.headline}
                      summary={item.summary}
                      source={item.source}
                      datetime={new Date(item.datetime * 1000).toLocaleString()}
                      url={item.url}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/6 bg-ink-900/80 p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Search results</h3>
              <span className="text-xs uppercase tracking-wider text-slate-500">Autocomplete</span>
            </div>
            {searchQuery.isLoading && (
              <div className="space-y-2">
                <div className="h-16 animate-pulse rounded-lg bg-white/5" />
                <div className="h-16 animate-pulse rounded-lg bg-white/5" />
              </div>
            )}
            {searchQuery.isError && !searchQuery.isLoading && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">Unable to search stocks.</div>
            )}
            {!searchQuery.isLoading && !searchQuery.isError && (
              <div className="space-y-2">
                {(searchQuery.data ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">No matches yet - try a different symbol.</div>
                ) : (
                  (searchQuery.data ?? []).slice(0, 6).map((item) => (
                    <StockCard key={item.symbol} symbol={item.symbol} description={item.description} onSelect={setSelectedSymbol} />
                  ))
                )}
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

          <div className="rounded-2xl border border-white/6 bg-ink-900/80 p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Recently viewed</h3>
              <span className="text-xs uppercase tracking-wider text-slate-500">Your last 5</span>
            </div>
            {recentlyViewedQuery.isLoading && (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded-lg bg-white/5" />
                <div className="h-10 animate-pulse rounded-lg bg-white/5" />
              </div>
            )}
            {recentlyViewedQuery.isError && !recentlyViewedQuery.isLoading && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">Unable to load recently viewed companies.</div>
            )}
            {!recentlyViewedQuery.isLoading && !recentlyViewedQuery.isError && (
              <div className="space-y-2">
                {(recentlyViewedQuery.data ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">Nothing viewed yet.</div>
                ) : (
                  (recentlyViewedQuery.data ?? []).map((item) => (
                    <div key={`${item.symbol}-${item.viewedAt}`} className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
                      <div className="font-medium text-white">{item.symbol}</div>
                      <div className="text-sm text-slate-400">{item.company}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stocks;
