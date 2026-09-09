import api from './api';
import axios from 'axios';
import type { CountryCode, CurrencyCode, MarketCode } from '../config/markets';
import type {
  CompetitorsResearch,
  ConvertedMonetaryValue,
  CorporateActionsResearch,
  FinancialStatementsResearch,
  FundamentalsOverview,
  NormalizedStockData,
  ReportingPeriod,
  ShareholdingResearch,
  StatementType
} from '../types/market-data';

export type MarketApiContext = {
  market?: MarketCode | null;
  currency?: CurrencyCode | null;
};

const marketParams = (context: MarketApiContext = {}) => ({
  market: context.market ?? undefined,
  currency: context.currency ?? undefined
});

const ERROR_MESSAGES: Record<string, string> = {
  INSTRUMENT_NOT_FOUND: 'Instrument not found.',
  MARKET_PROVIDER_UNAVAILABLE: 'Market data provider not yet available for this market.',
  PROVIDER_AUTHENTICATION_FAILED: 'The market data provider is temporarily unavailable.',
  COMPANY_PROFILE_UNAVAILABLE: 'Company profile is unavailable for this instrument.',
  QUOTE_UNAVAILABLE: 'The latest quote is unavailable for this instrument.',
  FUNDAMENTALS_UNAVAILABLE: 'Company fundamentals are unavailable for this instrument.',
  TEMPORARY_PROVIDER_ERROR: 'Market data is temporarily unavailable.',
  NEWS_PROVIDER_UNAVAILABLE: 'News temporarily unavailable.',
  NEWS_TEMPORARY_ERROR: 'News temporarily unavailable.'
};

export const getStockErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const response = error.response?.data as { code?: string; message?: string } | undefined;
  return (response?.code && ERROR_MESSAGES[response.code]) || response?.message || fallback;
};

export type SearchResult = {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
  companyName: string;
  exchange: string | null;
  exchangeCode: string | null;
  market: MarketCode | null;
  countryCode: CountryCode | null;
  countryName: string | null;
  currency: CurrencyCode | null;
  isin: string | null;
  instrumentType: string | null;
  provider: 'finnhub' | 'upstox' | 'twelveData';
  providerInstrumentKey?: string;
};

export type StockProfile = {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  marketCapitalization: number | null;
  currency: string;
  country: string;
  ipo: string;
  logo: string;
  weburl: string;
  isin?: string;
  description?: string;
  sector?: string;
  instrumentKey?: string;
  marketCapitalizationMoney?: ConvertedMonetaryValue;
  sectorMarketCapitalization?: ConvertedMonetaryValue & { unit: 'crore' };
};

export type StockQuote = {
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  sourceCurrency?: CurrencyCode;
  monetary?: {
    currentPrice?: ConvertedMonetaryValue;
    change?: ConvertedMonetaryValue;
    high?: ConvertedMonetaryValue;
    low?: ConvertedMonetaryValue;
    open?: ConvertedMonetaryValue;
    previousClose?: ConvertedMonetaryValue;
  };
};

export type StockNewsItem = {
  id: string;
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
  imageUrl?: string;
  symbols?: string[];
  companyName?: string;
  exchange?: string;
  country?: string;
};

export type Recommendation = {
  symbol: string;
  buy: number;
  hold: number;
  sell: number;
  period: string;
};

export async function searchStocks(query: string, context: MarketApiContext = {}): Promise<SearchResult[]> {
  const response = await api.get<SearchResult[]>('/api/stocks/search', {
    params: { q: query, ...marketParams(context) }
  });
  return response.data;
}

export async function fetchStockProfile(symbol: string, context: MarketApiContext = {}): Promise<StockProfile> {
  const response = await api.get<StockProfile>(`/api/stocks/${symbol}/profile`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchStockQuote(symbol: string, context: MarketApiContext = {}): Promise<StockQuote> {
  const response = await api.get<StockQuote>(`/api/stocks/${symbol}/quote`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchStockNews(symbol: string, context: MarketApiContext = {}): Promise<StockNewsItem[]> {
  const response = await api.get<StockNewsItem[]>(`/api/stocks/${symbol}/news`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchRecommendation(symbol: string, context: MarketApiContext = {}): Promise<Recommendation> {
  const response = await api.get<Recommendation>(`/api/stocks/${symbol}/recommendation`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchNormalizedStock(
  symbol: string,
  context: MarketApiContext = {}
): Promise<NormalizedStockData> {
  const response = await api.get<NormalizedStockData>(`/api/stocks/${symbol}`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchStockFundamentals(
  symbol: string,
  context: MarketApiContext = {}
): Promise<FundamentalsOverview> {
  const response = await api.get<FundamentalsOverview>(`/api/stocks/${symbol}/fundamentals`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchStockStatements(
  symbol: string,
  options: { statementType: StatementType; reportingPeriod: ReportingPeriod },
  context: MarketApiContext = {}
): Promise<FinancialStatementsResearch> {
  const response = await api.get<FinancialStatementsResearch>(`/api/stocks/${symbol}/statements`, {
    params: {
      ...marketParams(context),
      type: options.statementType,
      period: options.reportingPeriod
    }
  });
  return response.data;
}

export async function fetchStockShareholding(
  symbol: string,
  context: MarketApiContext = {}
): Promise<ShareholdingResearch> {
  const response = await api.get<ShareholdingResearch>(`/api/stocks/${symbol}/shareholding`, {
    params: marketParams(context)
  });
  return response.data;
}

export async function fetchStockCorporateActions(
  symbol: string,
  context: MarketApiContext = {}
): Promise<CorporateActionsResearch> {
  const response = await api.get<CorporateActionsResearch>(
    `/api/stocks/${symbol}/corporate-actions`,
    { params: marketParams(context) }
  );
  return response.data;
}

export async function fetchStockCompetitors(
  symbol: string,
  context: MarketApiContext = {}
): Promise<CompetitorsResearch> {
  const response = await api.get<CompetitorsResearch>(`/api/stocks/${symbol}/competitors`, {
    params: marketParams(context)
  });
  return response.data;
}

export type StockSnapshot = {
  symbol: string;
  market?: MarketCode;
  quote: StockQuote | null;
  profile: StockProfile | null;
};

export async function fetchStockSnapshots(
  instruments: Array<{ symbol: string; market?: MarketCode }>,
  currency?: CurrencyCode | null
): Promise<StockSnapshot[]> {
  if (instruments.length === 0) return [];
  const chunks: Array<Array<{ symbol: string; market?: MarketCode }>> = [];
  for (let index = 0; index < instruments.length; index += 40) {
    chunks.push(instruments.slice(index, index + 40));
  }
  const responses = await Promise.all(
    chunks.map((chunk) =>
      api.post<{ snapshots: StockSnapshot[] }>('/api/stocks/snapshots', {
        instruments: chunk,
        currency: currency ?? undefined
      })
    )
  );
  return responses.flatMap((response) => response.data.snapshots);
}

export async function fetchRecentlyViewed(): Promise<
  Array<{
    symbol: string;
    company: string;
    market?: MarketCode;
    exchange?: string;
    countryCode?: CountryCode;
    currency?: CurrencyCode;
    isin?: string;
    viewedAt: string;
  }>
> {
  const response = await api.get<
    Array<{
      symbol: string;
      company: string;
      market?: MarketCode;
      exchange?: string;
      countryCode?: CountryCode;
      currency?: CurrencyCode;
      isin?: string;
      viewedAt: string;
    }>
  >('/api/recently-viewed');
  return response.data;
}
