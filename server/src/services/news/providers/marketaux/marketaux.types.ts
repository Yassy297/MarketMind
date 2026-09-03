export type MarketauxEntity = {
  symbol?: string;
  name?: string;
  exchange?: string | null;
  exchange_long?: string | null;
  country?: string;
  type?: string;
  industry?: string;
  match_score?: number;
  sentiment_score?: number;
};

export type MarketauxArticle = {
  uuid?: string;
  title?: string;
  description?: string;
  snippet?: string;
  url?: string;
  image_url?: string;
  language?: string;
  published_at?: string;
  source?: string;
  relevance_score?: number | null;
  entities?: MarketauxEntity[];
};

export type MarketauxNewsResponse = {
  meta?: {
    found?: number;
    returned?: number;
    limit?: number;
    page?: number;
  };
  data?: MarketauxArticle[];
};

export type MarketauxEntitySearchResult = {
  symbol?: string;
  name?: string;
  type?: string;
  industry?: string;
  exchange?: string | null;
  exchange_long?: string | null;
  country?: string;
};

export type MarketauxEntitySearchResponse = {
  meta?: {
    found?: number;
    returned?: number;
    limit?: number;
    page?: number;
  };
  data?: MarketauxEntitySearchResult[];
};
