import axios from 'axios';
import { env } from '../../../../config/env';
import type { SearchResult } from '../../marketData.types';
import { MarketDataError } from '../../marketData.errors';

type UpstoxInstrument = {
  name?: string;
  segment?: string;
  exchange?: string;
  isin?: string;
  instrument_key?: string;
  trading_symbol?: string;
  short_name?: string;
  instrument_type?: string;
};

type UpstoxSearchResponse = {
  status?: string;
  data?: UpstoxInstrument[];
};

type CacheEntry<T> = { value: T; expiresAt: number };

const SEARCH_TTL_MS = 5 * 60 * 1000;
const RESOLUTION_TTL_MS = 12 * 60 * 60 * 1000;

const client = axios.create({
  baseURL: 'https://api.upstox.com/v2',
  timeout: 10_000,
  headers: { Accept: 'application/json' }
});

const suffixForExchange = (exchange: string) =>
  exchange === 'NSE' ? '.NS' : exchange === 'BSE' ? '.BO' : '';

const parseSymbol = (symbol: string) => {
  const normalized = symbol.trim().toUpperCase();
  if (normalized.endsWith('.NS')) return { tradingSymbol: normalized.slice(0, -3), exchange: 'NSE' };
  if (normalized.endsWith('.BO')) return { tradingSymbol: normalized.slice(0, -3), exchange: 'BSE' };
  return { tradingSymbol: normalized, exchange: undefined };
};

export class UpstoxInstrumentService {
  private readonly searchCache = new Map<string, CacheEntry<SearchResult[]>>();
  private readonly resolutionCache = new Map<string, CacheEntry<SearchResult>>();

  async search(query: string, prioritizeIndia: boolean): Promise<SearchResult[]> {
    this.assertConfigured();
    const normalizedQuery = parseSymbol(query).tradingSymbol;
    const cacheKey = `${normalizedQuery}:${prioritizeIndia ? 'IN' : 'GLOBAL'}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    try {
      const { data } = await client.get<UpstoxSearchResponse>('/instruments/search', {
        headers: { Authorization: `Bearer ${env.upstoxAccessToken}` },
        params: {
          query: normalizedQuery,
          exchanges: prioritizeIndia ? 'NSE,BSE' : undefined,
          segments: 'EQ',
          page_number: 1,
          records: 30
        }
      });

      const results = (data.data ?? [])
        .filter(
          (item) =>
            Boolean(item.trading_symbol && item.exchange && item.instrument_key && item.isin) &&
            (item.segment === 'NSE_EQ' || item.segment === 'BSE_EQ')
        )
        .map((item): SearchResult => {
          const exchange = item.exchange!;
          const tradingSymbol = item.trading_symbol!.toUpperCase();
          return {
            symbol: `${tradingSymbol}${suffixForExchange(exchange)}`,
            displaySymbol: tradingSymbol,
            description: item.name || item.short_name || tradingSymbol,
            type: item.instrument_type || 'Equity',
            companyName: item.name || item.short_name || tradingSymbol,
            exchange,
            exchangeCode: item.segment ?? exchange,
            market: 'IN',
            countryCode: 'IN',
            countryName: 'India',
            currency: 'INR',
            isin: item.isin!,
            instrumentType: item.instrument_type || 'EQ',
            provider: 'upstox',
            providerInstrumentKey: item.instrument_key
          };
        });

      this.searchCache.set(cacheKey, { value: results, expiresAt: Date.now() + SEARCH_TTL_MS });
      return results;
    } catch (error) {
      this.throwProviderError(error);
    }
  }

  async resolve(symbol: string): Promise<SearchResult> {
    const normalized = symbol.trim().toUpperCase();
    const cached = this.resolutionCache.get(normalized);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const requested = parseSymbol(normalized);
    const results = await this.search(requested.tradingSymbol, true);
    const exactMatches = results.filter(
      (result) =>
        result.displaySymbol.toUpperCase() === requested.tradingSymbol &&
        (!requested.exchange || result.exchange === requested.exchange)
    );
    const resolved =
      exactMatches.find((result) => result.exchange === requested.exchange) ??
      exactMatches.find((result) => result.exchange === 'NSE') ??
      exactMatches[0];

    if (!resolved) {
      throw new MarketDataError('INSTRUMENT_NOT_FOUND', `Instrument ${normalized} was not found.`);
    }

    this.resolutionCache.set(normalized, {
      value: resolved,
      expiresAt: Date.now() + RESOLUTION_TTL_MS
    });
    return resolved;
  }

  async resolveByIsin(isin: string): Promise<SearchResult> {
    const normalized = isin.trim().toUpperCase();
    const cacheKey = `ISIN:${normalized}`;
    const cached = this.resolutionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const results = await this.search(normalized, true);
    const resolved =
      results.find((result) => result.isin === normalized && result.exchange === 'NSE') ??
      results.find((result) => result.isin === normalized);
    if (!resolved) {
      throw new MarketDataError(
        'INSTRUMENT_NOT_FOUND',
        `Instrument for ISIN ${normalized} was not found.`
      );
    }
    this.resolutionCache.set(cacheKey, {
      value: resolved,
      expiresAt: Date.now() + RESOLUTION_TTL_MS
    });
    return resolved;
  }

  private assertConfigured() {
    if (!env.upstoxAccessToken) {
      throw new MarketDataError(
        'MARKET_PROVIDER_UNAVAILABLE',
        'Indian market data is not configured.'
      );
    }
  }

  private throwProviderError(error: unknown): never {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      throw new MarketDataError(
        'PROVIDER_AUTHENTICATION_FAILED',
        'Indian market data authentication is currently unavailable.'
      );
    }
    throw new MarketDataError(
      'TEMPORARY_PROVIDER_ERROR',
      'Indian instrument data is temporarily unavailable.'
    );
  }
}

export const upstoxInstrumentService = new UpstoxInstrumentService();
