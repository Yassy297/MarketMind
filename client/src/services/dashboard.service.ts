import api from './api';

export type DashboardSummary = {
  documentsCount: number;
  watchlistCount: number;
  conversationsCount: number;
  recentlyViewedCompanies: Array<{
    symbol: string;
    name: string;
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

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>('/api/dashboard');
  return response.data;
}
