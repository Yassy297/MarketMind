export type CountryCode =
  | 'IN' | 'US' | 'GB' | 'CA' | 'AU' | 'JP' | 'CN' | 'HK' | 'SG' | 'CH' | 'KR'
  | 'BR' | 'MX' | 'ZA' | 'AE' | 'SA' | 'NZ' | 'DE' | 'FR' | 'NL' | 'ES' | 'IT';
export type MarketCode = CountryCode;
export type CurrencyCode =
  | 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'HKD'
  | 'SGD' | 'CHF' | 'KRW' | 'BRL' | 'MXN' | 'ZAR' | 'AED' | 'SAR' | 'NZD';

export type MarketPreferences = {
  country: CountryCode | null;
  market: MarketCode | null;
  currency: CurrencyCode | null;
  currencyCustomized: boolean;
};

export type MarketDefinition = {
  countryCode: CountryCode;
  countryName: string;
  market: MarketCode;
  defaultCurrency: CurrencyCode;
  flag: string;
  exchanges: readonly string[];
};

export const MARKETS: Record<MarketCode, MarketDefinition> = {
  IN: { countryCode: 'IN', countryName: 'India', market: 'IN', defaultCurrency: 'INR', flag: '🇮🇳', exchanges: ['NSE', 'BSE'] },
  US: { countryCode: 'US', countryName: 'United States', market: 'US', defaultCurrency: 'USD', flag: '🇺🇸', exchanges: ['NASDAQ', 'NYSE', 'AMEX'] },
  GB: { countryCode: 'GB', countryName: 'United Kingdom', market: 'GB', defaultCurrency: 'GBP', flag: '🇬🇧', exchanges: ['LSE'] },
  CA: { countryCode: 'CA', countryName: 'Canada', market: 'CA', defaultCurrency: 'CAD', flag: '🇨🇦', exchanges: ['TSX', 'TSXV'] },
  AU: { countryCode: 'AU', countryName: 'Australia', market: 'AU', defaultCurrency: 'AUD', flag: '🇦🇺', exchanges: ['ASX'] },
  JP: { countryCode: 'JP', countryName: 'Japan', market: 'JP', defaultCurrency: 'JPY', flag: '🇯🇵', exchanges: ['TSE'] },
  CN: { countryCode: 'CN', countryName: 'China', market: 'CN', defaultCurrency: 'CNY', flag: '🇨🇳', exchanges: ['SSE', 'SZSE'] },
  HK: { countryCode: 'HK', countryName: 'Hong Kong', market: 'HK', defaultCurrency: 'HKD', flag: '🇭🇰', exchanges: ['HKEX'] },
  SG: { countryCode: 'SG', countryName: 'Singapore', market: 'SG', defaultCurrency: 'SGD', flag: '🇸🇬', exchanges: ['SGX'] },
  CH: { countryCode: 'CH', countryName: 'Switzerland', market: 'CH', defaultCurrency: 'CHF', flag: '🇨🇭', exchanges: ['SIX'] },
  KR: { countryCode: 'KR', countryName: 'South Korea', market: 'KR', defaultCurrency: 'KRW', flag: '🇰🇷', exchanges: ['KRX', 'KOSDAQ'] },
  BR: { countryCode: 'BR', countryName: 'Brazil', market: 'BR', defaultCurrency: 'BRL', flag: '🇧🇷', exchanges: ['B3'] },
  MX: { countryCode: 'MX', countryName: 'Mexico', market: 'MX', defaultCurrency: 'MXN', flag: '🇲🇽', exchanges: ['BMV'] },
  ZA: { countryCode: 'ZA', countryName: 'South Africa', market: 'ZA', defaultCurrency: 'ZAR', flag: '🇿🇦', exchanges: ['JSE'] },
  AE: { countryCode: 'AE', countryName: 'United Arab Emirates', market: 'AE', defaultCurrency: 'AED', flag: '🇦🇪', exchanges: ['ADX', 'DFM'] },
  SA: { countryCode: 'SA', countryName: 'Saudi Arabia', market: 'SA', defaultCurrency: 'SAR', flag: '🇸🇦', exchanges: ['TADAWUL'] },
  NZ: { countryCode: 'NZ', countryName: 'New Zealand', market: 'NZ', defaultCurrency: 'NZD', flag: '🇳🇿', exchanges: ['NZX'] },
  DE: { countryCode: 'DE', countryName: 'Germany', market: 'DE', defaultCurrency: 'EUR', flag: '🇩🇪', exchanges: ['XETRA', 'FWB'] },
  FR: { countryCode: 'FR', countryName: 'France', market: 'FR', defaultCurrency: 'EUR', flag: '🇫🇷', exchanges: ['EURONEXT PARIS'] },
  NL: { countryCode: 'NL', countryName: 'Netherlands', market: 'NL', defaultCurrency: 'EUR', flag: '🇳🇱', exchanges: ['EURONEXT AMSTERDAM'] },
  ES: { countryCode: 'ES', countryName: 'Spain', market: 'ES', defaultCurrency: 'EUR', flag: '🇪🇸', exchanges: ['BME'] },
  IT: { countryCode: 'IT', countryName: 'Italy', market: 'IT', defaultCurrency: 'EUR', flag: '🇮🇹', exchanges: ['BORSA ITALIANA'] }
};

export type CurrencyDefinition = { code: CurrencyCode; name: string; symbol: string; locale: string };
export const CURRENCIES: Record<CurrencyCode, CurrencyDefinition> = {
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥', locale: 'zh-CN' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'zh-HK' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', locale: 'es-MX' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', locale: 'ar-SA' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' }
};
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCIES) as CurrencyCode[];

export const isMarketCode = (value: string | null): value is MarketCode =>
  Boolean(value && value in MARKETS);
