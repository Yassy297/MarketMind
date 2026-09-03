import type { MarketRequestContext } from '../../../../types/market';
import type {
  AnalystRecommendation,
  CompanyProfile,
  MarketDataCapability,
  MarketDataProvider,
  NewsItem,
  PriceData,
  SearchResult
} from '../../marketData.types';

const unavailable = (): never => {
  throw new Error('The Twelve Data market-data provider has not been configured.');
};

export class TwelveDataProvider implements MarketDataProvider {
  readonly name = 'twelveData' as const;

  isConfigured(): boolean {
    return false;
  }

  supports(_capability: MarketDataCapability): boolean {
    return false;
  }

  async search(_query: string, _context: MarketRequestContext): Promise<SearchResult[]> {
    return unavailable();
  }

  async getProfile(_symbol: string, _context: MarketRequestContext): Promise<CompanyProfile> {
    return unavailable();
  }

  async getQuote(_symbol: string, _context: MarketRequestContext): Promise<PriceData> {
    return unavailable();
  }

  async getNews(_symbol: string, _context: MarketRequestContext): Promise<NewsItem[]> {
    return unavailable();
  }

  async getRecommendation(
    _symbol: string,
    _context: MarketRequestContext
  ): Promise<AnalystRecommendation> {
    return unavailable();
  }
}

export const twelveDataProvider = new TwelveDataProvider();
