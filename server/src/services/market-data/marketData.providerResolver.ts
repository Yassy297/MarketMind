import { MARKET_CONFIG, type MarketProviderName } from '../../config/markets';
import { env } from '../../config/env';
import type { MarketCode } from '../../types/market';
import { finnhubProvider } from './providers/finnhub/finnhub.provider';
import { twelveDataProvider } from './providers/twelveData/twelveData.provider';
import { upstoxProvider } from './providers/upstox/upstox.provider';
import type { MarketDataCapability, MarketDataProvider } from './marketData.types';
import { MarketDataError } from './marketData.errors';

const providers: Record<MarketProviderName, MarketDataProvider> = {
  finnhub: finnhubProvider,
  upstox: upstoxProvider,
  twelveData: twelveDataProvider
};

const isProviderName = (value: string | undefined): value is MarketProviderName =>
  value === 'finnhub' || value === 'upstox' || value === 'twelveData';

const configuredProviderForMarket = (market?: MarketCode): MarketProviderName | undefined => {
  const configured = market === 'IN' ? env.marketProviderIn : market === 'US' ? env.marketProviderUs : env.marketProviderDefault;
  return isProviderName(configured) ? configured : undefined;
};

export class MarketDataProviderResolver {
  private candidates(market?: MarketCode): MarketDataProvider[] {
    const candidates: MarketProviderName[] = [];
    const configured = configuredProviderForMarket(market);

    if (configured) candidates.push(configured);
    if (market) candidates.push(...MARKET_CONFIG[market].preferredProviders);
    if (!market && isProviderName(env.marketProviderDefault)) candidates.push(env.marketProviderDefault);
    candidates.push('finnhub');
    if (market === 'IN') candidates.push('upstox');
    candidates.push('twelveData');

    return [...new Set(candidates)].map((name) => providers[name]);
  }

  resolveAll(market: MarketCode | undefined, capability: MarketDataCapability): MarketDataProvider[] {
    return this.candidates(market).filter(
      (provider) => provider.isConfigured() && provider.supports(capability)
    );
  }

  resolve(market: MarketCode | undefined, capability: MarketDataCapability): MarketDataProvider {
    const available = this.resolveOptional(market, capability);

    if (!available) {
      throw new MarketDataError(
        'MARKET_PROVIDER_UNAVAILABLE',
        'Market data provider not yet available for this market.'
      );
    }
    return available;
  }

  resolveOptional(
    market: MarketCode | undefined,
    capability: MarketDataCapability
  ): MarketDataProvider | undefined {
    return this.resolveAll(market, capability)[0];
  }
}

export const marketDataProviderResolver = new MarketDataProviderResolver();
