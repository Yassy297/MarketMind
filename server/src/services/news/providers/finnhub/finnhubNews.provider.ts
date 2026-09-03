import { finnhubProvider } from '../../../market-data/providers/finnhub/finnhub.provider';
import type { NewsIdentity, NewsItem, NewsProvider, NewsRequestContext } from '../../news.types';

const annotate = (items: NewsItem[]): NewsItem[] =>
  items.map((item) => ({ ...item, sourceProvider: 'finnhub' as const }));

export class FinnhubNewsProvider implements NewsProvider {
  readonly name = 'finnhub' as const;

  isConfigured(): boolean {
    return finnhubProvider.isConfigured();
  }

  async getLatestNews(_context: NewsRequestContext): Promise<NewsItem[]> {
    return annotate(await finnhubProvider.getGeneralMarketNews());
  }

  async getEntityNews(identity: NewsIdentity, context: NewsRequestContext): Promise<NewsItem[]> {
    return annotate(await finnhubProvider.getNews(identity.displaySymbol || identity.symbol, context));
  }

  async searchNews(query: string, context: NewsRequestContext): Promise<NewsItem[]> {
    return annotate(await finnhubProvider.getNews(query, context));
  }
}

export const finnhubNewsProvider = new FinnhubNewsProvider();
