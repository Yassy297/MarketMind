import { marketDataProviderResolver } from './marketData.providerResolver';
import type { SearchResult } from './marketData.types';
import type { MarketRequestContext } from '../../types/market';
import { MarketDataError } from './marketData.errors';
import { normalizeInstrumentSearchQuery } from './instrumentSearch.query';

type SearchableProvider = {
  search: (query: string, context: MarketRequestContext) => Promise<SearchResult[]>;
};

const enrichKnownListing = (result: SearchResult): SearchResult => {
  const symbol = result.symbol.toUpperCase();
  if (symbol.endsWith('.NS')) {
    return {
      ...result,
      exchange: result.exchange ?? 'NSE',
      exchangeCode: result.exchangeCode ?? 'NSE_EQ',
      market: 'IN',
      countryCode: 'IN',
      countryName: 'India',
      currency: 'INR'
    };
  }
  if (symbol.endsWith('.BO')) {
    return {
      ...result,
      exchange: result.exchange ?? 'BSE',
      exchangeCode: result.exchangeCode ?? 'BSE_EQ',
      market: 'IN',
      countryCode: 'IN',
      countryName: 'India',
      currency: 'INR'
    };
  }
  return result;
};

export const searchWithProviders = async (
  query: string,
  context: MarketRequestContext,
  providers: SearchableProvider[]
): Promise<SearchResult[]> => {
  const normalizedQuery = normalizeInstrumentSearchQuery(query);
  if (!normalizedQuery) return [];
  if (providers.length === 0) {
    throw new MarketDataError(
      'MARKET_PROVIDER_UNAVAILABLE',
      'Market data provider not yet available for this market.'
    );
  }

  const responses = await Promise.allSettled(
    providers.map((provider) => provider.search(normalizedQuery, context))
  );
  const fulfilled = responses
    .filter((response): response is PromiseFulfilledResult<SearchResult[]> => response.status === 'fulfilled')
    .flatMap((response) => response.value)
    .map(enrichKnownListing)
    .filter((result) => Boolean(result.symbol && result.companyName));

  if (fulfilled.length === 0 && responses.every((response) => response.status === 'rejected')) {
    const firstError = responses.find(
      (response): response is PromiseRejectedResult => response.status === 'rejected'
    );
    if (firstError?.reason instanceof MarketDataError) throw firstError.reason;
  }

  const deduplicated = new Map<string, SearchResult>();
  for (const result of fulfilled) {
    const key = `${result.symbol.toUpperCase()}::${(result.exchangeCode ?? result.exchange ?? '').toUpperCase()}`;
    if (!deduplicated.has(key)) {
      const publicResult = { ...result };
      delete publicResult.providerInstrumentKey;
      deduplicated.set(key, publicResult);
    }
  }

  return [...deduplicated.values()]
    .sort((left, right) => {
      const score = (result: SearchResult) => {
        if (result.market === context.market) return 0;
        if (context.market === 'US' && !result.symbol.includes('.')) return 1;
        return 2;
      };
      return score(left) - score(right);
    })
    .slice(0, 20);
};

class InstrumentSearchService {
  async search(query: string, context: MarketRequestContext): Promise<SearchResult[]> {
    const providers = marketDataProviderResolver.resolveAll(context.market, 'search');
    return searchWithProviders(query, context, providers);
  }
}

export const instrumentSearchService = new InstrumentSearchService();
