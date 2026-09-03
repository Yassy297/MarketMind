import api from './api';
import type { CountryCode, CurrencyCode, MarketCode } from '../config/markets';

export type DashboardSummary = {
  documentsCount: number;
  watchlistCount: number;
  conversationsCount: number;
  recentlyViewedCompanies: Array<{
    symbol: string;
    name: string;
    market?: MarketCode;
    exchange?: string;
    countryCode?: CountryCode;
    currency?: CurrencyCode;
    isin?: string;
    lastViewedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: string;
  }>;
};

export async function fetchDashboardSummary(context: {
  market?: MarketCode | null;
  currency?: CurrencyCode | null;
} = {}): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>('/api/dashboard', {
    params: {
      market: context.market ?? undefined,
      currency: context.currency ?? undefined
    }
  });
  return response.data;
}
