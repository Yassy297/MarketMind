import api from './api';
import type {
  JournalAnalyticsFilters,
  JournalAnalyticsReport,
  JournalAnalyticsResponse,
  JournalCalendarDay,
  JournalCalendarMonth,
  JournalListResponse,
  JournalOverview,
  JournalStats,
  JournalTrade,
  JournalTradeInput
} from '../types/journal';

export type JournalListParams = {
  search?: string;
  assetClass?: string;
  market?: string;
  direction?: string;
  status?: string;
  strategy?: string;
  setup?: string;
  tags?: string;
  from?: string;
  to?: string;
  outcome?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
};

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (
      error as {
        response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
      }
    ).response;
    const firstField = response?.data?.errors?.find((item) => item.message)?.message;
    return firstField || response?.data?.message || fallback;
  }
  return fallback;
};

export const getJournalErrorMessage = errorMessage;

export const JOURNAL_CACHE_KEYS = [
  'journal-trades',
  'journal-stats',
  'journal-overview',
  'journal-calendar',
  'journal-analytics'
] as const;

export const invalidateJournalCaches = (queryClient: {
  invalidateQueries: (options: { queryKey: string[] }) => unknown;
}, tradeId?: string) => {
  JOURNAL_CACHE_KEYS.forEach((key) => {
    void queryClient.invalidateQueries({ queryKey: [key] });
  });
  if (tradeId) void queryClient.invalidateQueries({ queryKey: ['journal-trade', tradeId] });
};

export const fetchJournalStats = async (): Promise<JournalStats> => {
  const response = await api.get<JournalStats>('/api/journal/stats');
  return response.data;
};

export const fetchJournalOverview = async (
  filters: JournalAnalyticsFilters = {}
): Promise<JournalOverview> => {
  const response = await api.get<JournalOverview>('/api/journal/overview', { params: filters });
  return response.data;
};

export const fetchJournalAnalytics = async (
  report: JournalAnalyticsReport,
  filters: JournalAnalyticsFilters = {}
): Promise<JournalAnalyticsResponse> => {
  const response = await api.get<JournalAnalyticsResponse>('/api/journal/analytics', {
    params: { report, ...filters }
  });
  return response.data;
};

export const fetchJournalCalendar = async (
  year: number,
  month: number
): Promise<JournalCalendarMonth> => {
  const response = await api.get<JournalCalendarMonth>('/api/journal/calendar', {
    params: { year, month }
  });
  return response.data;
};

export const fetchJournalCalendarDay = async (date: string): Promise<JournalCalendarDay> => {
  const response = await api.get<JournalCalendarDay>('/api/journal/calendar/day', {
    params: { date }
  });
  return response.data;
};

export const fetchJournalTrades = async (
  params: JournalListParams = {}
): Promise<JournalListResponse> => {
  const response = await api.get<JournalListResponse>('/api/journal/trades', { params });
  return response.data;
};

export const fetchJournalTrade = async (id: string): Promise<JournalTrade> => {
  const response = await api.get<JournalTrade>(`/api/journal/trades/${id}`);
  return response.data;
};

export const createJournalTrade = async (input: JournalTradeInput): Promise<JournalTrade> => {
  const response = await api.post<JournalTrade>('/api/journal/trades', input);
  return response.data;
};

export const updateJournalTrade = async (
  id: string,
  input: Partial<JournalTradeInput>
): Promise<JournalTrade> => {
  const response = await api.patch<JournalTrade>(`/api/journal/trades/${id}`, input);
  return response.data;
};

export const deleteJournalTrade = async (id: string): Promise<void> => {
  await api.delete(`/api/journal/trades/${id}`);
};

export const duplicateJournalTrade = async (id: string): Promise<JournalTrade> => {
  const response = await api.post<JournalTrade>(`/api/journal/trades/${id}/duplicate`);
  return response.data;
};
