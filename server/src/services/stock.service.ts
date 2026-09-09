import { Types } from 'mongoose';
import { RecentlyViewed } from '../models/RecentlyViewed';
import type { CountryCode, CurrencyCode, MarketRequestContext } from '../types/market';
import { isCurrencyCode } from '../config/currencies';
import { MARKET_CONFIG } from '../config/markets';
import { marketDataService } from './market-data/marketData.service';
import { newsService } from './news/news.service';
import type { StockSnapshotsInput } from '../validators/stock.validators';
import type {
  AnalystRecommendation,
  CompetitorsResearch,
  CompanyProfile,
  CorporateActionsResearch,
  FinancialStatementOptions,
  FinancialStatementsResearch,
  FundamentalsOverview,
  NewsItem,
  NormalizedStockData,
  PriceData,
  SearchResult,
  ShareholdingResearch
} from './market-data/marketData.types';

export class RecentlyViewedError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'RecentlyViewedError';
  }
}

export type StockSnapshot = {
  symbol: string;
  market?: MarketRequestContext['market'];
  quote: PriceData | null;
  profile: CompanyProfile | null;
};

class StockService {
  async searchStocks(query: string, context: MarketRequestContext = {}): Promise<SearchResult[]> {
    return marketDataService.search(query, context);
  }

  async getStockProfile(symbol: string, context: MarketRequestContext = {}): Promise<CompanyProfile> {
    return marketDataService.getProfile(symbol, context);
  }

  async getStockQuote(symbol: string, context: MarketRequestContext = {}): Promise<PriceData> {
    return marketDataService.getQuote(symbol, context);
  }

  async getStockNews(symbol: string, context: MarketRequestContext = {}): Promise<NewsItem[]> {
    const profile = await this.getStockProfile(symbol, context).catch(() => undefined);
    return newsService.getStockNews(symbol, context, profile);
  }

  async getRecommendation(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<AnalystRecommendation> {
    return marketDataService.getRecommendation(symbol, context);
  }

  async getStock(symbol: string, context: MarketRequestContext = {}): Promise<NormalizedStockData> {
    return marketDataService.getStock(symbol, context);
  }

  async getSnapshots(input: StockSnapshotsInput): Promise<{ snapshots: StockSnapshot[] }> {
    const seen = new Set<string>();
    const unique = input.instruments.filter((instrument) => {
      const key = `${instrument.symbol}:${instrument.market ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const snapshots = await Promise.all(
      unique.map(async (instrument) => {
        const context: MarketRequestContext = {
          market: instrument.market,
          displayCurrency: input.currency
        };
        const [quote, profile] = await Promise.all([
          this.getStockQuote(instrument.symbol, context).catch(() => null),
          this.getStockProfile(instrument.symbol, context).catch(() => null)
        ]);
        return {
          symbol: instrument.symbol,
          market: instrument.market,
          quote,
          profile
        };
      })
    );

    return { snapshots };
  }

  async getFundamentals(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<FundamentalsOverview> {
    return marketDataService.getFundamentals(symbol, context);
  }

  async getFinancialStatements(
    symbol: string,
    options: FinancialStatementOptions,
    context: MarketRequestContext = {}
  ): Promise<FinancialStatementsResearch> {
    return marketDataService.getFinancialStatements(symbol, options, context);
  }

  async getShareholding(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<ShareholdingResearch> {
    return marketDataService.getShareholding(symbol, context);
  }

  async getCorporateActions(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<CorporateActionsResearch> {
    return marketDataService.getCorporateActions(symbol, context);
  }

  async getCompetitors(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<CompetitorsResearch> {
    return marketDataService.getCompetitors(symbol, context);
  }

  async getGeneralMarketNews(limit = 6): Promise<NewsItem[]> {
    return (await newsService.getLatestNews()).slice(0, limit);
  }

  async recordRecentlyViewed(
    userId: string,
    symbol: string,
    profile: CompanyProfile,
    context: MarketRequestContext
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    await RecentlyViewed.findOneAndUpdate(
      { user: userObjectId, symbol: symbol.toUpperCase() },
      {
        $set: {
          company: profile.name || symbol,
          market: context.market,
          exchange: profile.exchange || undefined,
          countryCode: context.market ? MARKET_CONFIG[context.market].countryCode : undefined,
          currency: isCurrencyCode(profile.currency) ? profile.currency : undefined,
          isin: profile.isin,
          viewedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  async getRecentlyViewed(
    userId: string
  ): Promise<Array<{
    symbol: string;
    company: string;
    market?: MarketRequestContext['market'];
    exchange?: string;
    countryCode?: CountryCode;
    currency?: CurrencyCode;
    isin?: string;
    viewedAt: string;
  }>> {
    const userObjectId = new Types.ObjectId(userId);
    const history = await RecentlyViewed.find({ user: userObjectId }).sort({ viewedAt: -1 }).limit(5).lean();

    return history.map((item) => ({
      symbol: item.symbol,
      company: item.company,
      market: item.market,
      exchange: item.exchange,
      countryCode: item.countryCode,
      currency: item.currency,
      isin: item.isin,
      viewedAt: item.viewedAt.toString()
    }));
  }

  async deleteRecentlyViewed(userId: string, symbol: string): Promise<void> {
    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!normalizedSymbol) {
      throw new RecentlyViewedError(404, 'Recently viewed stock not found.');
    }

    const deleted = await RecentlyViewed.findOneAndDelete({
      user: new Types.ObjectId(userId),
      symbol: normalizedSymbol
    });

    if (!deleted) {
      throw new RecentlyViewedError(404, 'Recently viewed stock not found.');
    }
  }
}

export const stockService = new StockService();
