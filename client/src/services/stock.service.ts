import api from './api';

export type SearchResult = {
  symbol: string;
  description: string;
  displaySymbol: string;
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

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const response = await api.get<SearchResult[]>('/api/stocks/search', { params: { q: query } });
  return response.data;
}

export async function fetchStockProfile(symbol: string): Promise<StockProfile> {
  const response = await api.get<StockProfile>(`/api/stocks/${symbol}/profile`);
  return response.data;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const response = await api.get<StockQuote>(`/api/stocks/${symbol}/quote`);
  return response.data;
}

export async function fetchStockNews(symbol: string): Promise<StockNewsItem[]> {
  const response = await api.get<StockNewsItem[]>(`/api/stocks/${symbol}/news`);
  return response.data;
}

export async function fetchRecommendation(symbol: string): Promise<Recommendation> {
  const response = await api.get<Recommendation>(`/api/stocks/${symbol}/recommendation`);
  return response.data;
}

export async function fetchRecentlyViewed(): Promise<Array<{ symbol: string; company: string; viewedAt: string }>> {
  const response = await api.get<Array<{ symbol: string; company: string; viewedAt: string }>>('/api/recently-viewed');
  return response.data;
}
