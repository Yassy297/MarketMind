import { CURRENCIES, type CurrencyCode } from '../config/markets';
import type { ConvertedMonetaryValue } from '../types/market-data';

const isSupportedCurrency = (currency: string): currency is CurrencyCode =>
  currency in CURRENCIES;

const format = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);

export const formatConvertedMonetaryValue = (
  money: ConvertedMonetaryValue | null | undefined,
  suffix = ''
): string => {
  if (!money) return 'Not available';
  if (money.conversionStatus === 'unavailable') return 'Conversion unavailable';
  const amount = money.convertedValue ?? money.value;
  const currency =
    money.convertedValue === null ? money.sourceCurrency : money.displayCurrency;
  return `${format(amount, currency)}${suffix}`;
};

export const formatJournalAmount = (
  value: number | null | undefined,
  currency: string
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (!isSupportedCurrency(currency)) return `${value.toFixed(2)} ${currency}`;
  return format(value, currency);
};

export const formatMonetaryValue = (
  value: number,
  sourceCurrency: string,
  displayCurrency: CurrencyCode | null,
  converted?: ConvertedMonetaryValue
): string => {
  if (!isSupportedCurrency(sourceCurrency)) return value.toFixed(2);
  if (!displayCurrency || displayCurrency === sourceCurrency) return format(value, sourceCurrency);
  if (!converted || converted.convertedValue === null) return 'Conversion unavailable';
  return format(converted.convertedValue, converted.displayCurrency);
};

export const formatMarketCapitalization = (
  valueInMillions: number,
  sourceCurrency: string,
  displayCurrency: CurrencyCode | null,
  converted?: ConvertedMonetaryValue
): string => {
  const amount = converted?.convertedValue ?? valueInMillions;
  if (
    displayCurrency &&
    displayCurrency !== sourceCurrency &&
    (!converted || converted.convertedValue === null)
  ) {
    return 'Conversion unavailable';
  }

  const currency =
    converted?.displayCurrency ??
    (isSupportedCurrency(sourceCurrency) ? sourceCurrency : null);
  if (!currency) return `${(amount / 1e3).toFixed(1)}B`;
  return `${format(amount / 1e3, currency)}B`;
};
