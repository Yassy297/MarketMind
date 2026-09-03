import type { CurrencyCode } from '../../types/market';
import type { ConvertedMonetaryValue, MonetaryValue } from '../market-data/marketData.types';
import type { ExchangeRateProvider } from './currency.types';
import { frankfurterExchangeRateProvider } from './frankfurter.provider';

export class CurrencyService {
  constructor(
    private readonly exchangeRateProvider: ExchangeRateProvider = frankfurterExchangeRateProvider
  ) {}

  async convert(money: MonetaryValue, displayCurrency: CurrencyCode): Promise<ConvertedMonetaryValue> {
    if (money.sourceCurrency === displayCurrency) {
      return {
        ...money,
        displayCurrency,
        convertedValue: money.value,
        conversionStatus: 'not-required'
      };
    }

    const rate = await this.exchangeRateProvider.getRate(money.sourceCurrency, displayCurrency);
    if (rate === null) {
      return {
        ...money,
        displayCurrency,
        convertedValue: null,
        conversionStatus: 'unavailable'
      };
    }

    return {
      ...money,
      displayCurrency,
      convertedValue: money.value * rate,
      conversionStatus: 'converted'
    };
  }
}

export const currencyService = new CurrencyService();
