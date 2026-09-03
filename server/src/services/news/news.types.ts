import type { CountryCode, MarketCode, MarketRequestContext } from '../../types/market';

export type NewsProviderName = 'marketaux' | 'finnhub';

export type NewsIdentity = {
  symbol: string;
  displaySymbol?: string;
  companyName?: string;
  exchange?: string;
  country?: CountryCode | string;
  isin?: string;
};

export type NewsItem = {
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
  sentiment?: number | null;
  publishedAt?: string;
  sourceProvider?: NewsProviderName;
};

export type NewsRequestContext = MarketRequestContext & {
  country?: CountryCode | string;
};

export interface NewsProvider {
  readonly name: NewsProviderName;
  isConfigured(): boolean;
  getLatestNews(context: NewsRequestContext): Promise<NewsItem[]>;
  getEntityNews(identity: NewsIdentity, context: NewsRequestContext): Promise<NewsItem[]>;
  searchNews(query: string, context: NewsRequestContext): Promise<NewsItem[]>;
}

export type { MarketCode };
