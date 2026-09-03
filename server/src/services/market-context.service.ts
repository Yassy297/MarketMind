import {
  getDefaultMarketForCountry,
  MARKET_CONFIG,
  SUPPORTED_CURRENCIES
} from '../config/markets';
import { User } from '../models/User';
import type { UserMarketPreferences } from '../types/market';
import { CURRENCY_CONFIG } from '../config/currencies';

export type MarketPreferenceUpdate = Partial<UserMarketPreferences>;

const EMPTY_PREFERENCES: UserMarketPreferences = {
  country: null,
  market: null,
  currency: null,
  currencyCustomized: false
};

const normalizePreferences = (
  preferences: UserMarketPreferences | undefined
): UserMarketPreferences => ({
  country: preferences?.country ?? null,
  market: preferences?.market ?? null,
  currency: preferences?.currency ?? null,
  currencyCustomized: preferences?.currencyCustomized ?? Boolean(preferences?.currency)
});

class MarketContextService {
  async getForUser(userId: string) {
    const user = await User.findById(userId).select('preferences').lean();
    if (!user) throw new Error('User not found.');

    return this.buildContext(normalizePreferences(user.preferences));
  }

  async updateForUser(userId: string, update: MarketPreferenceUpdate) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found.');

    const preferences = {
      ...EMPTY_PREFERENCES,
      ...normalizePreferences(user.preferences),
      ...update
    };

    if ('country' in update) {
      preferences.market = update.country ? getDefaultMarketForCountry(update.country) : null;
    }

    if ('currency' in update) {
      preferences.currencyCustomized = update.currency !== null;
    }

    if (
      'country' in update &&
      preferences.country &&
      !preferences.currencyCustomized
    ) {
      preferences.currency = MARKET_CONFIG[preferences.market!].defaultCurrency;
    }

    if (
      (preferences.country === null && preferences.market !== null) ||
      (preferences.country !== null &&
        (preferences.market === null ||
          MARKET_CONFIG[preferences.market].countryCode !== preferences.country))
    ) {
      throw new Error('The selected market does not match the selected country.');
    }

    user.preferences = preferences;
    await user.save();
    return this.buildContext(preferences);
  }

  private buildContext(preferences: UserMarketPreferences) {
    return {
      preferences,
      supportedMarkets: Object.values(MARKET_CONFIG),
      supportedCurrencies: SUPPORTED_CURRENCIES,
      currencyDefinitions: Object.values(CURRENCY_CONFIG)
    };
  }
}

export const marketContextService = new MarketContextService();
