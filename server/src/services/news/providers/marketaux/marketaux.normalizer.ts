import type { NewsIdentity, NewsItem } from '../../news.types';
import type { MarketauxArticle, MarketauxEntity } from './marketaux.types';

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const publishedTimestamp = (value: string | undefined) => {
  if (!value) return Math.floor(Date.now() / 1000);
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : Math.floor(Date.now() / 1000);
};

const matchingEntity = (entities: MarketauxEntity[] | undefined, identity: NewsIdentity) => {
  const wanted = identityTokens(identity);
  return (entities ?? []).find((entity) => {
    const symbol = text(entity.symbol).toUpperCase();
    const name = text(entity.name).toLowerCase();
    return (
      wanted.symbols.has(symbol) ||
      (wanted.company && name.includes(wanted.company)) ||
      (wanted.company && wanted.company.includes(name) && name.length >= 4)
    );
  });
};

export const identityTokens = (identity: NewsIdentity) => {
  const trading = identity.symbol.replace(/\.(NS|BO)$/i, '').toUpperCase();
  const display = (identity.displaySymbol ?? trading).replace(/\.(NS|BO)$/i, '').toUpperCase();
  const company = stripLegalSuffix(identity.companyName ?? '').toLowerCase();
  return {
    symbols: new Set([identity.symbol.toUpperCase(), trading, display].filter(Boolean)),
    company,
    trading
  };
};

export const stripLegalSuffix = (name: string) =>
  name
    .replace(/\b(limited|ltd|plc|inc|incorporated|corp|corporation|co|company|the)\b\.?/gi, '')
    .replace(/[,.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isIndianIdentity = (identity: NewsIdentity) =>
  identity.country?.toUpperCase() === 'IN' ||
  /\.(NS|BO)$/i.test(identity.symbol);

const symbolMatchesIdentity = (symbol: string, identity: NewsIdentity) => {
  const tokens = identityTokens(identity);
  const normalized = symbol.toUpperCase();
  if (isIndianIdentity(identity)) {
    return normalized === identity.symbol.toUpperCase() || normalized === `${tokens.trading}.NS` || normalized === `${tokens.trading}.BO`;
  }
  return tokens.symbols.has(normalized);
};

export const isRelevantArticle = (article: NewsItem, identity: NewsIdentity) => {
  const tokens = identityTokens(identity);
  const haystack = `${article.headline} ${article.summary}`.toLowerCase();
  const companyHit = Boolean(tokens.company && tokens.company.length >= 4 && haystack.includes(tokens.company));
  if (companyHit) return true;

  const identityCountry = identity.country?.toUpperCase();
  const articleCountry = article.country?.toUpperCase();
  if (identityCountry && articleCountry && identityCountry !== articleCountry) return false;

  if (article.symbols?.some((symbol) => symbolMatchesIdentity(symbol, identity))) return true;
  if (isIndianIdentity(identity)) {
    return haystack.includes(`${tokens.trading.toLowerCase()}.ns`) || haystack.includes(tokens.trading.toLowerCase() + ' ');
  }
  return Boolean(tokens.trading && haystack.includes(tokens.trading.toLowerCase()));
};

export const normalizeMarketauxArticle = (
  article: MarketauxArticle,
  identity?: NewsIdentity
): NewsItem | null => {
  const headline = text(article.title);
  const url = text(article.url);
  if (!headline || !url) return null;
  const entity = matchingEntity(article.entities, identity ?? { symbol: '' });
  const sentiment =
    typeof entity?.sentiment_score === 'number' ? entity.sentiment_score : null;
  return {
    id: text(article.uuid) || url,
    headline,
    summary: text(article.description) || text(article.snippet),
    url,
    datetime: publishedTimestamp(article.published_at),
    source: text(article.source) || 'Unknown source',
    imageUrl: text(article.image_url) || undefined,
    symbols: (article.entities ?? [])
      .map((item) => text(item.symbol))
      .filter(Boolean),
    companyName: text(entity?.name) || identity?.companyName,
    exchange: text(entity?.exchange_long || entity?.exchange) || identity?.exchange,
    country: text(entity?.country).toUpperCase() || identity?.country,
    sentiment,
    publishedAt: article.published_at,
    sourceProvider: 'marketaux'
  };
};
