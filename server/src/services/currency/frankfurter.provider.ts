import axios from 'axios';
import type { CurrencyCode } from '../../types/market';
import type { ExchangeRateProvider } from './currency.types';

type CacheEntry = {
  rate: number;
  expiresAt: number;
};

type FrankfurterRateResponse = {
  base?: string;
  quote?: string;
  rate?: number;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export class FrankfurterExchangeRateProvider implements ExchangeRateProvider {
  readonly name = 'frankfurter';
  private readonly client = axios.create({
    baseURL: 'https://api.frankfurter.dev/v2',
    timeout: 8_000
  });
  private readonly cache = new Map<string, CacheEntry>();
  private readonly pending = new Map<string, Promise<number | null>>();

  async getRate(sourceCurrency: CurrencyCode, displayCurrency: CurrencyCode): Promise<number | null> {
    if (sourceCurrency === displayCurrency) return 1;

    const key = `${sourceCurrency}:${displayCurrency}`;
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.rate;

    const existingRequest = this.pending.get(key);
    if (existingRequest) return existingRequest;

    const request = this.fetchRate(sourceCurrency, displayCurrency).finally(() => {
      this.pending.delete(key);
    });
    this.pending.set(key, request);
    return request;
  }

  private async fetchRate(
    sourceCurrency: CurrencyCode,
    displayCurrency: CurrencyCode
  ): Promise<number | null> {
    try {
      const { data } = await this.client.get<FrankfurterRateResponse>(
        `/rate/${sourceCurrency}/${displayCurrency}`
      );
      const rate = Number(data.rate);
      if (!Number.isFinite(rate) || rate <= 0) return null;

      this.cache.set(`${sourceCurrency}:${displayCurrency}`, {
        rate,
        expiresAt: Date.now() + CACHE_TTL_MS
      });
      return rate;
    } catch {
      return null;
    }
  }
}

export const frankfurterExchangeRateProvider = new FrankfurterExchangeRateProvider();
