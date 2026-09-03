import axios from 'axios';
import { env } from '../../../../config/env';
import { NewsError } from '../../news.errors';
import type { NewsIdentity, NewsItem, NewsProvider, NewsRequestContext } from '../../news.types';
import { identityTokens, isRelevantArticle, normalizeMarketauxArticle } from './marketaux.normalizer';
import type {
  MarketauxEntitySearchResponse,
  MarketauxNewsResponse
} from './marketaux.types';

const NEWS_LIMIT = 3;
const client = axios.create({
  baseURL: 'https://api.marketaux.com/v1',
  timeout: 10_000
});

const countryCode = (value?: string) => value?.trim().slice(0, 2).toLowerCase();

export class MarketauxNewsProvider implements NewsProvider {
  readonly name = 'marketaux' as const;

  isConfigured(): boolean {
    return Boolean(env.marketauxApiKey);
  }

  async getLatestNews(context: NewsRequestContext): Promise<NewsItem[]> {
    const country = countryCode(context.country ?? context.market);
    return this.fetchNews(
      {
        language: 'en',
        ...(country ? { countries: country } : {})
      }
    );
  }

  async getEntityNews(identity: NewsIdentity, context: NewsRequestContext): Promise<NewsItem[]> {
    const symbols = await this.resolveEntitySymbols(identity, context);
    if (!symbols.length) return [];
    const articles = await this.fetchNews(
      {
        symbols: symbols.join(','),
        filter_entities: true,
        language: 'en'
      },
      identity
    );
    return articles.filter((article) => isRelevantArticle(article, identity));
  }

  async searchNews(query: string, context: NewsRequestContext): Promise<NewsItem[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const country = countryCode(context.country ?? context.market);
    return this.fetchNews({
      search: `"${trimmed.replace(/"/g, '')}"`,
      language: 'en',
      ...(country ? { countries: country } : {})
    });
  }

  private async resolveEntitySymbols(
    identity: NewsIdentity,
    context: NewsRequestContext
  ): Promise<string[]> {
    const tokens = identityTokens(identity);
    const country = countryCode(identity.country ?? context.country ?? context.market);
    const searches = [tokens.trading, identity.companyName].filter(
      (value): value is string => Boolean(value)
    );
    const resolved = new Set<string>();

    for (const search of searches) {
      const matches = await this.searchEntities(search, country);
      for (const match of matches) {
        if (!match.symbol) continue;
        const sameCountry = !country || !match.country || match.country.toLowerCase() === country;
        const sameName =
          Boolean(tokens.company) &&
          (match.name?.toLowerCase().includes(tokens.company) ||
            tokens.company.includes((match.name ?? '').toLowerCase()));
        const matchSymbol = match.symbol.toUpperCase();
        const sameSymbol =
          matchSymbol === identity.symbol.toUpperCase() ||
          matchSymbol === `${tokens.trading}.NS` ||
          matchSymbol === `${tokens.trading}.BO` ||
          (!country && tokens.symbols.has(matchSymbol));
        if (sameCountry && (sameSymbol || sameName)) {
          resolved.add(match.symbol);
        }
      }
      if (resolved.size) break;
    }

    if (!resolved.size) {
      resolved.add(
        /\.(NS|BO)$/i.test(identity.symbol) ? identity.symbol : tokens.trading
      );
    }
    return [...resolved];
  }

  private async searchEntities(search: string, country?: string) {
    this.assertConfigured();
    try {
      const { data } = await client.get<MarketauxEntitySearchResponse>('/entity/search', {
        params: {
          api_token: env.marketauxApiKey,
          search,
          types: 'equity',
          ...(country ? { countries: country } : {})
        }
      });
      return data.data ?? [];
    } catch (error) {
      this.throwProviderError(error);
    }
  }

  private async fetchNews(
    params: Record<string, string | boolean | number>,
    identity?: NewsIdentity
  ): Promise<NewsItem[]> {
    this.assertConfigured();
    try {
      const { data } = await client.get<MarketauxNewsResponse>('/news/all', {
        params: {
          api_token: env.marketauxApiKey,
          limit: NEWS_LIMIT,
          ...params
        }
      });
      return (data.data ?? [])
        .map((article) => normalizeMarketauxArticle(article, identity))
        .filter((article): article is NewsItem => Boolean(article));
    } catch (error) {
      this.throwProviderError(error);
    }
  }

  private assertConfigured() {
    if (!env.marketauxApiKey) {
      throw new NewsError('NEWS_PROVIDER_UNAVAILABLE', 'Financial news is not configured.');
    }
  }

  private throwProviderError(error: unknown): never {
    if (error instanceof NewsError) throw error;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    console.warn('News provider request failed.', { provider: 'marketaux', status });
    if (status === 401 || status === 403) {
      throw new NewsError(
        'NEWS_PROVIDER_UNAVAILABLE',
        'Financial news authentication is currently unavailable.'
      );
    }
    throw new NewsError('NEWS_TEMPORARY_ERROR', 'Financial news is temporarily unavailable.');
  }
}

export const marketauxNewsProvider = new MarketauxNewsProvider();
