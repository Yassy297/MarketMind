import { finnhubNewsProvider } from './providers/finnhub/finnhubNews.provider';
import { marketauxNewsProvider } from './providers/marketaux/marketaux.provider';
import type { NewsProvider } from './news.types';

export class NewsProviderResolver {
  resolveAll(): NewsProvider[] {
    return [marketauxNewsProvider, finnhubNewsProvider].filter((provider) => provider.isConfigured());
  }

  resolve(): NewsProvider | undefined {
    return this.resolveAll()[0];
  }
}

export const newsProviderResolver = new NewsProviderResolver();
