import type { CurrencyCode } from '../../types/market';

export interface ExchangeRateProvider {
  readonly name: string;
  getRate(sourceCurrency: CurrencyCode, displayCurrency: CurrencyCode): Promise<number | null>;
}
