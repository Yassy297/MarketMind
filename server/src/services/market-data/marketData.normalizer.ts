import type {
  AnalystRecommendation,
  CompanyProfile,
  NewsItem,
  PriceData,
  SearchResult
} from './marketData.types';

const text = (value: unknown, fallback = '') => String(value ?? fallback);
const number = (value: unknown, fallback = 0) => Number(value ?? fallback);

export const normalizeFinnhubSearchResults = (items: Array<Record<string, unknown>>): SearchResult[] =>
  items.map((item) => ({
    symbol: text(item.symbol),
    displaySymbol: text(item.displaySymbol),
    description: text(item.description),
    type: text(item.type),
    companyName: text(item.description),
    exchange: null,
    exchangeCode: null,
    market: null,
    countryCode: null,
    countryName: null,
    currency: null,
    isin: null,
    instrumentType: text(item.type) || null,
    provider: 'finnhub'
  }));

export const normalizeFinnhubProfile = (data: Record<string, unknown>, symbol: string): CompanyProfile => ({
  name: text(data.name),
  ticker: text(data.ticker, symbol),
  exchange: text(data.exchange),
  industry: text(data.finnhubIndustry ?? data.industry),
  marketCapitalization: number(data.marketCapitalization),
  currency: text(data.currency),
  country: text(data.country),
  ipo: text(data.ipo),
  logo: text(data.logo),
  weburl: text(data.weburl)
});

export const normalizeFinnhubQuote = (data: Record<string, unknown>): PriceData => ({
  currentPrice: number(data.c),
  change: number(data.d),
  percentChange: number(data.dp),
  high: number(data.h),
  low: number(data.l),
  open: number(data.o),
  previousClose: number(data.pc),
  timestamp: number(data.t, Date.now())
});

export const normalizeFinnhubNews = (items: Array<Record<string, unknown>>): NewsItem[] =>
  items.slice(0, 8).map((item) => ({
    id: text(item.id),
    headline: text(item.headline),
    summary: text(item.summary),
    url: text(item.url),
    datetime: number(item.datetime),
    source: text(item.source)
  }));

export const normalizeFinnhubRecommendation = (
  item: Record<string, unknown> | undefined,
  symbol: string
): AnalystRecommendation => ({
  symbol,
  buy: number(item?.buy),
  hold: number(item?.hold),
  sell: number(item?.sell),
  period: text(item?.period, 'N/A')
});
