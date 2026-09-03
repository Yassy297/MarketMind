import type { CurrencyCode } from '../types/market';

export type CurrencyDefinition = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
};

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyDefinition> = {
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

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIG) as CurrencyCode[];

export const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  typeof value === 'string' && value in CURRENCY_CONFIG;
