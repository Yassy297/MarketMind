import axios from 'axios';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { RecentlyViewed } from '../models/RecentlyViewed';

const finnhubBaseUrl = 'https://finnhub.io/api/v1';
const finnhubClient = axios.create({
  baseURL: finnhubBaseUrl,
  params: {
    token: env.finnhubApiKey
  }
});

export type SearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

export type StockProfile = {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  marketCapitalization: number;
  currency: string;
  country: string;
  ipo: string;
  logo: string;
  weburl: string;
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
};

export type StockNewsItem = {
  id: string;
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
};

export type Recommendation = {
  symbol: string;
  buy: number;
  hold: number;
  sell: number;
  period: string;
};

class StockService {
  async searchStocks(query: string): Promise<SearchResult[]> {
    const { data } = await finnhubClient.get<{ result?: Array<Record<string, unknown>> }>('/search', {
      params: { q: query }
    });

    return (data.result ?? []).map((item: Record<string, unknown>) => ({
      symbol: String(item.symbol ?? ''),
      displaySymbol: String(item.displaySymbol ?? ''),
      description: String(item.description ?? ''),
      type: String(item.type ?? '')
    }));
  }

  async getStockProfile(symbol: string): Promise<StockProfile> {
    const { data } = await finnhubClient.get<Record<string, unknown>>('/stock/profile2', {
      params: { symbol }
    });

    return {
      name: String(data.name ?? ''),
      ticker: String(data.ticker ?? symbol),
      exchange: String(data.exchange ?? ''),
      industry: String(data.finnhubIndustry ?? data.industry ?? ''),
      marketCapitalization: Number(data.marketCapitalization ?? 0),
      currency: String(data.currency ?? ''),
      country: String(data.country ?? ''),
      ipo: String(data.ipo ?? ''),
      logo: String(data.logo ?? ''),
      weburl: String(data.weburl ?? '')
    };
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const { data } = await finnhubClient.get<Record<string, unknown>>('/quote', {
      params: { symbol }
    });

    return {
      currentPrice: Number(data.c ?? 0),
      change: Number(data.d ?? 0),
      percentChange: Number(data.dp ?? 0),
      high: Number(data.h ?? 0),
      low: Number(data.l ?? 0),
      open: Number(data.o ?? 0),
      previousClose: Number(data.pc ?? 0),
      timestamp: Number(data.t ?? Date.now())
    };
  }

  async getStockNews(symbol: string): Promise<StockNewsItem[]> {
    const { data } = await finnhubClient.get<Array<Record<string, unknown>>>('/news', {
      params: { symbol, minId: 0 }
    });

    return (data ?? []).slice(0, 8).map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ''),
      headline: String(item.headline ?? ''),
      summary: String(item.summary ?? ''),
      url: String(item.url ?? ''),
      datetime: Number(item.datetime ?? 0),
      source: String(item.source ?? '')
    }));
  }

  async getRecommendation(symbol: string): Promise<Recommendation> {
    const { data } = await finnhubClient.get<Array<Record<string, unknown>>>('/stock/recommendation', {
      params: { symbol }
    });

    const first = (data ?? [])[0];
    return {
      symbol,
      buy: Number(first?.buy ?? 0),
      hold: Number(first?.hold ?? 0),
      sell: Number(first?.sell ?? 0),
      period: String(first?.period ?? 'N/A')
    };
  }

  async getGeneralMarketNews(limit = 6): Promise<StockNewsItem[]> {
    const { data } = await finnhubClient.get<Array<Record<string, unknown>>>('/news', {
      params: { category: 'general' }
    });

    return (data ?? []).slice(0, limit).map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ''),
      headline: String(item.headline ?? ''),
      summary: String(item.summary ?? ''),
      url: String(item.url ?? ''),
      datetime: Number(item.datetime ?? 0),
      source: String(item.source ?? '')
    }));
  }

  async recordRecentlyViewed(userId: string, symbol: string, company: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    await RecentlyViewed.findOneAndUpdate(
      { user: userObjectId, symbol: symbol.toUpperCase() },
      { $set: { company, viewedAt: new Date() } },
      { upsert: true, new: true }
    );
  }

  async getRecentlyViewed(userId: string): Promise<Array<{ symbol: string; company: string; viewedAt: string }>> {
    const userObjectId = new Types.ObjectId(userId);
    const history = await RecentlyViewed.find({ user: userObjectId }).sort({ viewedAt: -1 }).limit(5).lean();

    return history.map((item) => ({
      symbol: item.symbol,
      company: item.company,
      viewedAt: item.viewedAt.toString()
    }));
  }
}

export const stockService = new StockService();
