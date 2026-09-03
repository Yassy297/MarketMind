import { MARKET_CONFIG } from '../../config/markets';
import type { CompanyProfile } from '../market-data/marketData.types';
import type { MarketRequestContext } from '../../types/market';
import { NewsError } from './news.errors';
import { newsProviderResolver } from './news.providerResolver';
import { isRelevantArticle } from './providers/marketaux/marketaux.normalizer';
import type { NewsIdentity, NewsItem, NewsProvider, NewsRequestContext } from './news.types';

const NEWS_TTL_MS = 15 * 60 * 1000;
const MAX_ITEMS = 8;

type CacheEntry = {
  value: NewsItem[];
  expiresAt: number;
};

const countryFromProfile = (
  profile: CompanyProfile | undefined,
  context: MarketRequestContext
) => {
  if (profile?.country === 'India') return 'IN';
  if (profile?.country && profile.country.length === 2) return profile.country.toUpperCase();
  if (context.market) return MARKET_CONFIG[context.market].countryCode;
  return undefined;
};

export class NewsService {
  private readonly cache = new Map<string, CacheEntry>();

  async getStockNews(
    symbol: string,
    context: MarketRequestContext = {},
    profile?: CompanyProfile
  ): Promise<NewsItem[]> {
    const identity = this.identityFrom(symbol, context, profile);
    const cacheKey = `entity:${identity.symbol}:${identity.country ?? ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const items = await this.collectEntityNews(identity, {
      ...context,
      country: identity.country
    });
    this.cache.set(cacheKey, { value: items, expiresAt: Date.now() + NEWS_TTL_MS });
    return items;
  }

  async getLatestNews(context: NewsRequestContext = {}): Promise<NewsItem[]> {
    const providers = newsProviderResolver.resolveAll();
    if (!providers.length) {
      throw new NewsError('NEWS_PROVIDER_UNAVAILABLE', 'Financial news is not configured.');
    }
    let lastError: unknown;
    for (const provider of providers) {
      try {
        return (await provider.getLatestNews(context)).slice(0, MAX_ITEMS);
      } catch (error) {
        lastError = error;
        this.logFailure(provider, error);
      }
    }
    throw this.toNewsError(lastError);
  }

  private async collectEntityNews(
    identity: NewsIdentity,
    context: NewsRequestContext
  ): Promise<NewsItem[]> {
    const providers = newsProviderResolver.resolveAll();
    if (!providers.length) {
      throw new NewsError('NEWS_PROVIDER_UNAVAILABLE', 'Financial news is not configured.');
    }

    let lastError: unknown;
    for (const provider of providers) {
      try {
        const items = await this.fallbackForProvider(provider, identity, context);
        return items.slice(0, MAX_ITEMS);
      } catch (error) {
        lastError = error;
        this.logFailure(provider, error);
      }
    }
    throw this.toNewsError(lastError);
  }

  private async fallbackForProvider(
    provider: NewsProvider,
    identity: NewsIdentity,
    context: NewsRequestContext
  ): Promise<NewsItem[]> {
    const entityNews = await provider.getEntityNews(identity, context);
    if (entityNews.length) return this.unique(entityNews);

    if (identity.companyName) {
      const named = this.filterRelevant(
        await provider.searchNews(identity.companyName, context),
        identity
      );
      if (named.length) return this.unique(named);
    }

    const companyQuery = [identity.companyName, identity.displaySymbol]
      .filter(Boolean)
      .join(' ');
    if (companyQuery) {
      const countryScoped = this.filterRelevant(
        await provider.searchNews(companyQuery, context),
        identity
      );
      if (countryScoped.length) return this.unique(countryScoped);
    }

    return [];
  }

  private identityFrom(
    symbol: string,
    context: MarketRequestContext,
    profile?: CompanyProfile
  ): NewsIdentity {
    const normalized = symbol.trim().toUpperCase();
    const trading = normalized.replace(/\.(NS|BO)$/i, '');
    return {
      symbol: normalized,
      displaySymbol: profile?.ticker || trading,
      companyName: profile?.name || undefined,
      exchange: profile?.exchange || undefined,
      country: countryFromProfile(profile, context),
      isin: profile?.isin
    };
  }

  private filterRelevant(items: NewsItem[], identity: NewsIdentity) {
    return items.filter((item) => isRelevantArticle(item, identity));
  }

  private unique(items: NewsItem[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = item.url || item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private logFailure(provider: NewsProvider, error: unknown) {
    console.warn('News provider fallback engaged.', {
      provider: provider.name,
      code: error instanceof NewsError ? error.code : undefined
    });
  }

  private toNewsError(error: unknown): NewsError {
    if (error instanceof NewsError) return error;
    return new NewsError('NEWS_TEMPORARY_ERROR', 'Financial news is temporarily unavailable.');
  }
}

export const newsService = new NewsService();
