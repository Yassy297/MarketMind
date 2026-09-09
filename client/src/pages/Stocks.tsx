import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMarketContext } from '../context/MarketContext';
import PageHeader from '../components/PageHeader';
import StockSearch from '../components/stock/StockSearch';
import StockHeader from '../components/stock/StockHeader';
import StockWatchlistControl from '../components/watchlist/StockWatchlistControl';
import FinancialCard from '../components/stock/FinancialCard';
import NewsCard from '../components/stock/NewsCard';
import RecommendationCard from '../components/stock/RecommendationCard';
import FundamentalsOverview from '../components/stock/FundamentalsOverview';
import FinancialStatements from '../components/stock/FinancialStatements';
import Shareholding from '../components/stock/Shareholding';
import CorporateActions from '../components/stock/CorporateActions';
import Competitors from '../components/stock/Competitors';
import {
  fetchRecentlyViewed,
  fetchRecommendation,
  fetchStockCompetitors,
  fetchStockCorporateActions,
  fetchStockFundamentals,
  fetchStockNews,
  fetchStockProfile,
  fetchStockQuote,
  fetchStockShareholding,
  fetchStockStatements,
  getStockErrorMessage,
  searchStocks
} from '../services/stock.service';
import {
  formatConvertedMonetaryValue,
  formatMarketCapitalization,
  formatMonetaryValue
} from '../utils/currency';
import { isMarketCode } from '../config/markets';
import type { ReportingPeriod, StatementType } from '../types/market-data';

const DEFAULT_SYMBOL = 'TSLA';
const normalizeSymbol = (symbol: string | null) => symbol?.trim().toUpperCase() ?? '';

const Stocks: React.FC = () => {
  const { market: preferredMarket, currency } = useMarketContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const marketFromUrl = searchParams.get('market');
  const hasMarketOverride = searchParams.has('market');
  const marketOverride = isMarketCode(marketFromUrl) ? marketFromUrl : null;
  const market = hasMarketOverride ? marketOverride : preferredMarket;
  const symbolFromUrl = normalizeSymbol(searchParams.get('symbol'));
  const initialSymbol = symbolFromUrl || DEFAULT_SYMBOL;
  const [query, setQuery] = useState(initialSymbol);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSymbol);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [searchActive, setSearchActive] = useState(false);
  const [statementType, setStatementType] = useState<StatementType>('consolidated');
  const [reportingPeriod, setReportingPeriod] = useState<ReportingPeriod>('yearly');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const nextSymbol = symbolFromUrl || DEFAULT_SYMBOL;
    setSelectedSymbol(nextSymbol);
    setQuery(nextSymbol);
    setDebouncedQuery(nextSymbol);
    setSearchActive(false);
  }, [symbolFromUrl]);

  const searchQuery = useQuery({
    queryKey: ['stocks-search', market, currency, debouncedQuery],
    queryFn: () => searchStocks(debouncedQuery, { market, currency }),
    enabled: searchActive && debouncedQuery.length > 0 && debouncedQuery === query.trim(),
    retry: false
  });

  const profileQuery = useQuery({
    queryKey: ['stock-profile', market, currency, selectedSymbol],
    queryFn: () => fetchStockProfile(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const quoteQuery = useQuery({
    queryKey: ['stock-quote', market, currency, selectedSymbol],
    queryFn: () => fetchStockQuote(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const newsQuery = useQuery({
    queryKey: ['stock-news', market, currency, selectedSymbol],
    queryFn: () => fetchStockNews(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const recommendationQuery = useQuery({
    queryKey: ['stock-recommendation', market, currency, selectedSymbol],
    queryFn: () => fetchRecommendation(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol),
    retry: false
  });

  const recentlyViewedQuery = useQuery({
    queryKey: ['recently-viewed'],
    queryFn: fetchRecentlyViewed,
    retry: false
  });

  const isIndianStock =
    market === 'IN' || selectedSymbol.endsWith('.NS') || selectedSymbol.endsWith('.BO');

  const fundamentalsQuery = useQuery({
    queryKey: ['stock-fundamentals', market, currency, selectedSymbol],
    queryFn: () => fetchStockFundamentals(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol) && isIndianStock,
    retry: false
  });

  const statementsQuery = useQuery({
    queryKey: [
      'stock-statements',
      market,
      currency,
      selectedSymbol,
      statementType,
      reportingPeriod
    ],
    queryFn: () =>
      fetchStockStatements(
        selectedSymbol,
        { statementType, reportingPeriod },
        { market, currency }
      ),
    enabled: Boolean(selectedSymbol) && isIndianStock,
    retry: false
  });

  const shareholdingQuery = useQuery({
    queryKey: ['stock-shareholding', market, selectedSymbol],
    queryFn: () => fetchStockShareholding(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol) && isIndianStock,
    retry: false
  });

  const corporateActionsQuery = useQuery({
    queryKey: ['stock-corporate-actions', market, currency, selectedSymbol],
    queryFn: () => fetchStockCorporateActions(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol) && isIndianStock,
    retry: false
  });

  const competitorsQuery = useQuery({
    queryKey: ['stock-competitors', market, currency, selectedSymbol],
    queryFn: () => fetchStockCompetitors(selectedSymbol, { market, currency }),
    enabled: Boolean(selectedSymbol) && isIndianStock,
    retry: false
  });

  const financialMetrics = useMemo(() => {
    const quote = quoteQuery.data;
    const profile = profileQuery.data;
    const sourceCurrency = quote?.sourceCurrency ?? profile?.currency ?? '';
    const formattedChange = quote
      ? formatMonetaryValue(quote.change, sourceCurrency, currency, quote.monetary?.change)
      : '-';
    return [
      {
        label: 'Current Price',
        value: quote
          ? formatMonetaryValue(
              quote.currentPrice,
              sourceCurrency,
              currency,
              quote.monetary?.currentPrice
            )
          : 'Not available'
      },
      {
        label: 'Day Change',
        value: quote ? `${formattedChange} (${quote.percentChange.toFixed(1)}%)` : '-'
      },
      {
        label: 'Market Cap',
        value: profile?.marketCapitalization
          ? formatMarketCapitalization(
              profile.marketCapitalization,
              profile.currency,
              currency,
              profile.marketCapitalizationMoney
            )
          : 'Not available'
      },
      ...(profile?.sectorMarketCapitalization
        ? [
            {
              label: 'Sector Market Cap',
              value: formatConvertedMonetaryValue(profile.sectorMarketCapitalization, ' Cr')
            }
          ]
        : []),
      { label: 'Currency', value: currency ?? profile?.currency ?? '-' }
    ];
  }, [currency, profileQuery.data, quoteQuery.data]);

  const selectStock = (symbol: string, selectedMarket = market) => {
    const normalizedSymbol = normalizeSymbol(symbol);
    if (!normalizedSymbol) return;

    setSelectedSymbol(normalizedSymbol);
    setQuery(normalizedSymbol);
    setDebouncedQuery(normalizedSymbol);
    setSearchActive(false);
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set('symbol', normalizedSymbol);
      nextParams.set('market', selectedMarket ?? '');
      return nextParams;
    });
  };

  const searchLoading =
    searchActive && query.trim().length > 0 && (query.trim() !== debouncedQuery || searchQuery.isFetching);
  const profileUnavailable =
    profileQuery.isError ||
    (profileQuery.isSuccess && !profileQuery.data.name && !profileQuery.data.exchange);

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Intelligence" subtitle="Search and analyze stocks with live market data." />

      <StockSearch
        query={query}
        onQueryChange={(value) => {
          setQuery(value);
          setSearchActive(value.trim().length > 0);
        }}
        onSubmit={() => selectStock(query || DEFAULT_SYMBOL)}
        onSelect={(result) => selectStock(result.symbol, result.market)}
        onSearchRequest={() => setSearchActive(true)}
        results={searchQuery.data ?? []}
        loading={searchLoading}
        error={searchQuery.isError}
        errorMessage={getStockErrorMessage(searchQuery.error, 'Unable to search stocks.')}
      />

      <StockHeader
        symbol={selectedSymbol}
        name={profileQuery.data?.name ?? selectedSymbol}
        exchange={profileQuery.data?.exchange || undefined}
        sector={profileQuery.data?.sector || fundamentalsQuery.data?.company.sector}
        isin={profileQuery.data?.isin || fundamentalsQuery.data?.company.identity.isin}
        country={profileQuery.data?.country}
        currency={profileQuery.data?.currency}
        loading={profileQuery.isLoading}
        action={
          selectedSymbol ? (
            <StockWatchlistControl
              symbol={selectedSymbol}
              market={market}
              profile={profileQuery.data}
            />
          ) : null
        }
      />

      {profileUnavailable ? (
        <div className="rounded-xl border border-negative/25 bg-negative/10 p-4 text-sm text-negative">
          {profileQuery.isError
            ? getStockErrorMessage(
                profileQuery.error,
                `Company profile is unavailable for ${selectedSymbol}.`
              )
            : `Company profile is unavailable for ${selectedSymbol}.`}
        </div>
      ) : null}

      {quoteQuery.isError ? (
        <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
          {getStockErrorMessage(quoteQuery.error, 'The latest quote is temporarily unavailable.')}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financialMetrics.map((metric) => (
          <FinancialCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            loading={profileQuery.isLoading || quoteQuery.isLoading}
          />
        ))}
      </div>

      {isIndianStock ? (
        <div className="space-y-4">
          <FundamentalsOverview
            data={fundamentalsQuery.data}
            quote={quoteQuery.data}
            displayCurrency={currency}
            loading={fundamentalsQuery.isLoading}
            error={
              fundamentalsQuery.isError
                ? getStockErrorMessage(
                    fundamentalsQuery.error,
                    'Unable to load company fundamentals.'
                  )
                : null
            }
          />
          <FinancialStatements
            data={statementsQuery.data}
            loading={statementsQuery.isLoading}
            error={
              statementsQuery.isError
                ? getStockErrorMessage(
                    statementsQuery.error,
                    'Unable to load financial statements.'
                  )
                : null
            }
            statementType={statementType}
            reportingPeriod={reportingPeriod}
            onStatementTypeChange={setStatementType}
            onReportingPeriodChange={setReportingPeriod}
          />
          <Shareholding
            data={shareholdingQuery.data}
            loading={shareholdingQuery.isLoading}
            error={
              shareholdingQuery.isError
                ? getStockErrorMessage(shareholdingQuery.error, 'Unable to load shareholding data.')
                : null
            }
          />
          <CorporateActions
            data={corporateActionsQuery.data}
            loading={corporateActionsQuery.isLoading}
            error={
              corporateActionsQuery.isError
                ? getStockErrorMessage(
                    corporateActionsQuery.error,
                    'Unable to load corporate actions.'
                  )
                : null
            }
          />
          <Competitors
            data={competitorsQuery.data}
            loading={competitorsQuery.isLoading}
            error={
              competitorsQuery.isError
                ? getStockErrorMessage(competitorsQuery.error, 'Unable to load competitors.')
                : null
            }
          />
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-fg">
              <Newspaper className="h-4 w-4 text-fg-muted" />
              Latest news
            </h3>
          </div>
          {newsQuery.isLoading && (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-lg bg-surface-hover" />
              <div className="h-20 animate-pulse rounded-lg bg-surface-hover" />
            </div>
          )}
          {newsQuery.isError && !newsQuery.isLoading && (
            <div className="rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm text-warning">
              {getStockErrorMessage(newsQuery.error, 'News temporarily unavailable.')}
            </div>
          )}
          {!newsQuery.isLoading && !newsQuery.isError && (
            <div className="grid gap-3">
              {(newsQuery.data ?? []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-fg-muted">
                  No recent news available.
                </div>
              ) : (
                (newsQuery.data ?? []).map((item) => (
                  <NewsCard
                    key={item.id}
                    headline={item.headline}
                    summary={item.summary}
                    source={item.source}
                    datetime={new Date(item.datetime * 1000).toLocaleString()}
                    url={item.url}
                    company={
                      [item.companyName, item.symbols?.[0] ?? selectedSymbol]
                        .filter(Boolean)
                        .join(' · ')
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <RecommendationCard
            buy={recommendationQuery.data?.buy ?? 0}
            hold={recommendationQuery.data?.hold ?? 0}
            sell={recommendationQuery.data?.sell ?? 0}
            period={recommendationQuery.data?.period ?? 'N/A'}
            loading={recommendationQuery.isLoading}
          />
          {recommendationQuery.isError ? (
            <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
              {getStockErrorMessage(
                recommendationQuery.error,
                'Analyst recommendations are unavailable for this instrument.'
              )}
            </div>
          ) : null}

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-fg">Recently viewed</h3>
              <span className="text-xs uppercase tracking-wider text-fg-muted">Your last 5</span>
            </div>
            {recentlyViewedQuery.isLoading && (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
                <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
              </div>
            )}
            {recentlyViewedQuery.isError && !recentlyViewedQuery.isLoading && (
              <div className="rounded-lg border border-negative/25 bg-negative/10 p-3 text-sm text-negative">
                Unable to load recently viewed companies.
              </div>
            )}
            {!recentlyViewedQuery.isLoading && !recentlyViewedQuery.isError && (
              <div className="space-y-2">
                {(recentlyViewedQuery.data ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-fg-muted">
                    Nothing viewed yet.
                  </div>
                ) : (
                  (recentlyViewedQuery.data ?? []).map((item) => (
                    <button
                      key={`${item.symbol}-${item.viewedAt}`}
                      type="button"
                      onClick={() => selectStock(item.symbol, item.market ?? market)}
                      className="w-full rounded-xl border border-line bg-surface-hover p-3 text-left transition hover:border-brand/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    >
                      <div className="font-medium text-fg">{item.symbol}</div>
                      <div className="text-sm text-fg-secondary">{item.company}</div>
                    </button>
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
