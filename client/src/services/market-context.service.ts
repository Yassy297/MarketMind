import type {
  CurrencyCode,
  MarketDefinition,
  MarketPreferences
} from '../config/markets';
import api from './api';

export type MarketContextResponse = {
  preferences: MarketPreferences;
  supportedMarkets: MarketDefinition[];
  supportedCurrencies: CurrencyCode[];
};

export async function fetchMarketContext(): Promise<MarketContextResponse> {
  const response = await api.get<MarketContextResponse>('/api/market/context');
  return response.data;
}

export async function updateMarketContext(
  preferences: Partial<MarketPreferences>
): Promise<MarketContextResponse> {
  const response = await api.patch<MarketContextResponse>('/api/market/context', preferences);
  return response.data;
}
