export type CountryCode =
  | 'IN'
  | 'US'
  | 'GB'
  | 'CA'
  | 'AU'
  | 'JP'
  | 'CN'
  | 'HK'
  | 'SG'
  | 'CH'
  | 'KR'
  | 'BR'
  | 'MX'
  | 'ZA'
  | 'AE'
  | 'SA'
  | 'NZ'
  | 'DE'
  | 'FR'
  | 'NL'
  | 'ES'
  | 'IT';

export type MarketCode = CountryCode;

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CNY'
  | 'HKD'
  | 'SGD'
  | 'CHF'
  | 'KRW'
  | 'BRL'
  | 'MXN'
  | 'ZAR'
  | 'AED'
  | 'SAR'
  | 'NZD';

export type UserMarketPreferences = {
  country: CountryCode | null;
  market: MarketCode | null;
  currency: CurrencyCode | null;
  currencyCustomized: boolean;
};

export type MarketRequestContext = {
  market?: MarketCode;
  displayCurrency?: CurrencyCode;
};
