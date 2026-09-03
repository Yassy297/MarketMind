import type { CountryCode, CurrencyCode, MarketCode } from '../types/market';
import { isCurrencyCode, SUPPORTED_CURRENCIES } from './currencies';

export type MarketProviderName = 'finnhub' | 'upstox' | 'twelveData';

export type MarketDefinition = {
  countryCode: CountryCode;
  countryName: string;
  market: MarketCode;
  defaultCurrency: CurrencyCode;
  flag: string;
  exchanges: readonly string[];
  preferredProviders: readonly MarketProviderName[];
};

export const MARKET_CONFIG: Record<MarketCode, MarketDefinition> = {
  IN: { countryCode: 'IN', countryName: 'India', market: 'IN', defaultCurrency: 'INR', flag: '🇮🇳', exchanges: ['NSE', 'BSE'], preferredProviders: ['upstox', 'finnhub'] },
  US: { countryCode: 'US', countryName: 'United States', market: 'US', defaultCurrency: 'USD', flag: '🇺🇸', exchanges: ['NASDAQ', 'NYSE', 'AMEX'], preferredProviders: ['finnhub', 'twelveData'] },
  GB: { countryCode: 'GB', countryName: 'United Kingdom', market: 'GB', defaultCurrency: 'GBP', flag: '🇬🇧', exchanges: ['LSE'], preferredProviders: ['finnhub', 'twelveData'] },
  CA: { countryCode: 'CA', countryName: 'Canada', market: 'CA', defaultCurrency: 'CAD', flag: '🇨🇦', exchanges: ['TSX', 'TSXV'], preferredProviders: ['finnhub', 'twelveData'] },
  AU: { countryCode: 'AU', countryName: 'Australia', market: 'AU', defaultCurrency: 'AUD', flag: '🇦🇺', exchanges: ['ASX'], preferredProviders: ['finnhub', 'twelveData'] },
  JP: { countryCode: 'JP', countryName: 'Japan', market: 'JP', defaultCurrency: 'JPY', flag: '🇯🇵', exchanges: ['TSE'], preferredProviders: ['finnhub', 'twelveData'] },
  CN: { countryCode: 'CN', countryName: 'China', market: 'CN', defaultCurrency: 'CNY', flag: '🇨🇳', exchanges: ['SSE', 'SZSE'], preferredProviders: ['finnhub', 'twelveData'] },
  HK: { countryCode: 'HK', countryName: 'Hong Kong', market: 'HK', defaultCurrency: 'HKD', flag: '🇭🇰', exchanges: ['HKEX'], preferredProviders: ['finnhub', 'twelveData'] },
  SG: { countryCode: 'SG', countryName: 'Singapore', market: 'SG', defaultCurrency: 'SGD', flag: '🇸🇬', exchanges: ['SGX'], preferredProviders: ['finnhub', 'twelveData'] },
  CH: { countryCode: 'CH', countryName: 'Switzerland', market: 'CH', defaultCurrency: 'CHF', flag: '🇨🇭', exchanges: ['SIX'], preferredProviders: ['finnhub', 'twelveData'] },
  KR: { countryCode: 'KR', countryName: 'South Korea', market: 'KR', defaultCurrency: 'KRW', flag: '🇰🇷', exchanges: ['KRX', 'KOSDAQ'], preferredProviders: ['finnhub', 'twelveData'] },
  BR: { countryCode: 'BR', countryName: 'Brazil', market: 'BR', defaultCurrency: 'BRL', flag: '🇧🇷', exchanges: ['B3'], preferredProviders: ['finnhub', 'twelveData'] },
  MX: { countryCode: 'MX', countryName: 'Mexico', market: 'MX', defaultCurrency: 'MXN', flag: '🇲🇽', exchanges: ['BMV'], preferredProviders: ['finnhub', 'twelveData'] },
  ZA: { countryCode: 'ZA', countryName: 'South Africa', market: 'ZA', defaultCurrency: 'ZAR', flag: '🇿🇦', exchanges: ['JSE'], preferredProviders: ['finnhub', 'twelveData'] },
  AE: { countryCode: 'AE', countryName: 'United Arab Emirates', market: 'AE', defaultCurrency: 'AED', flag: '🇦🇪', exchanges: ['ADX', 'DFM'], preferredProviders: ['finnhub', 'twelveData'] },
  SA: { countryCode: 'SA', countryName: 'Saudi Arabia', market: 'SA', defaultCurrency: 'SAR', flag: '🇸🇦', exchanges: ['TADAWUL'], preferredProviders: ['finnhub', 'twelveData'] },
  NZ: { countryCode: 'NZ', countryName: 'New Zealand', market: 'NZ', defaultCurrency: 'NZD', flag: '🇳🇿', exchanges: ['NZX'], preferredProviders: ['finnhub', 'twelveData'] },
  DE: { countryCode: 'DE', countryName: 'Germany', market: 'DE', defaultCurrency: 'EUR', flag: '🇩🇪', exchanges: ['XETRA', 'FWB'], preferredProviders: ['finnhub', 'twelveData'] },
  FR: { countryCode: 'FR', countryName: 'France', market: 'FR', defaultCurrency: 'EUR', flag: '🇫🇷', exchanges: ['EURONEXT PARIS'], preferredProviders: ['finnhub', 'twelveData'] },
  NL: { countryCode: 'NL', countryName: 'Netherlands', market: 'NL', defaultCurrency: 'EUR', flag: '🇳🇱', exchanges: ['EURONEXT AMSTERDAM'], preferredProviders: ['finnhub', 'twelveData'] },
  ES: { countryCode: 'ES', countryName: 'Spain', market: 'ES', defaultCurrency: 'EUR', flag: '🇪🇸', exchanges: ['BME'], preferredProviders: ['finnhub', 'twelveData'] },
  IT: { countryCode: 'IT', countryName: 'Italy', market: 'IT', defaultCurrency: 'EUR', flag: '🇮🇹', exchanges: ['BORSA ITALIANA'], preferredProviders: ['finnhub', 'twelveData'] }
};

export const isMarketCode = (value: unknown): value is MarketCode =>
  typeof value === 'string' && value in MARKET_CONFIG;

export const isCountryCode = (value: unknown): value is CountryCode =>
  typeof value === 'string' &&
  Object.values(MARKET_CONFIG).some((market) => market.countryCode === value);

export const getDefaultMarketForCountry = (country: CountryCode): MarketCode => {
  const definition = Object.values(MARKET_CONFIG).find(
    (market) => market.countryCode === country
  );
  if (!definition) throw new Error(`No market is configured for country: ${country}`);
  return definition.market;
};

export { isCurrencyCode, SUPPORTED_CURRENCIES };
