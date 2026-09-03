import axios from 'axios';
import { env } from '../../../../config/env';
import {
  normalizeFinnhubNews,
  normalizeFinnhubProfile,
  normalizeFinnhubQuote,
  normalizeFinnhubRecommendation,
  normalizeFinnhubSearchResults
} from '../../marketData.normalizer';
import type {
  AnalystRecommendation,
  CompanyProfile,
  MarketDataProvider,
  MarketDataCapability,
  NewsItem,
  PriceData,
  SearchResult
} from '../../marketData.types';
import type { MarketRequestContext } from '../../../../types/market';
import { MarketDataError } from '../../marketData.errors';

const client = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: { token: env.finnhubApiKey }
});

export class FinnhubProvider implements MarketDataProvider {
  readonly name = 'finnhub' as const;

  isConfigured(): boolean {
    return Boolean(env.finnhubApiKey);
  }

  supports(capability: MarketDataCapability): boolean {
    return ['search', 'profile', 'quote', 'news', 'recommendation'].includes(capability);
  }

  async search(query: string, _context: MarketRequestContext): Promise<SearchResult[]> {
    const { data } = await client.get<{ result?: Array<Record<string, unknown>> }>('/search', {
      params: { q: query }
    });
    return normalizeFinnhubSearchResults(data.result ?? []);
  }

  async getProfile(symbol: string, _context: MarketRequestContext): Promise<CompanyProfile> {
    const { data } = await client.get<Record<string, unknown>>('/stock/profile2', {
      params: { symbol }
    });
    const profile = normalizeFinnhubProfile(data, symbol);
    if (!profile.name && !profile.exchange) {
      throw new MarketDataError(
        'COMPANY_PROFILE_UNAVAILABLE',
        `Company profile is unavailable for ${symbol}.`
      );
    }
    return profile;
  }

  async getQuote(symbol: string, _context: MarketRequestContext): Promise<PriceData> {
    const { data } = await client.get<Record<string, unknown>>('/quote', {
      params: { symbol }
    });
    const quote = normalizeFinnhubQuote(data);
    if (!quote.timestamp || (!quote.currentPrice && !quote.previousClose)) {
      throw new MarketDataError('QUOTE_UNAVAILABLE', `Quote is unavailable for ${symbol}.`);
    }
    return quote;
  }

  async getNews(symbol: string, _context: MarketRequestContext): Promise<NewsItem[]> {
    const { data } = await client.get<Array<Record<string, unknown>>>('/news', {
      params: { symbol, minId: 0 }
    });
    return normalizeFinnhubNews(data ?? []);
  }

  async getRecommendation(symbol: string, _context: MarketRequestContext): Promise<AnalystRecommendation> {
    const { data } = await client.get<Array<Record<string, unknown>>>('/stock/recommendation', {
      params: { symbol }
    });
    return normalizeFinnhubRecommendation(data?.[0], symbol);
  }

  async getGeneralMarketNews(limit = 6): Promise<NewsItem[]> {
    const { data } = await client.get<Array<Record<string, unknown>>>('/news', {
      params: { category: 'general' }
    });
    return normalizeFinnhubNews(data ?? []).slice(0, limit);
  }
}

export const finnhubProvider = new FinnhubProvider();
