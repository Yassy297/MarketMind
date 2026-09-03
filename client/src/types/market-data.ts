import type { CurrencyCode, MarketCode } from '../config/markets';

export type FinancialFieldKind = 'monetary' | 'percentage' | 'ratio' | 'count' | 'text' | 'date';

export type ConvertedMonetaryValue = {
  value: number;
  sourceCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  convertedValue: number | null;
  conversionStatus: 'not-required' | 'converted' | 'unavailable';
};

export type StockIdentity = {
  symbol: string;
  displaySymbol: string;
  name: string;
  market?: MarketCode;
  exchange?: string;
  instrumentType?: string;
  isin?: string;
  countryCode?: string;
  currency?: CurrencyCode;
  provider?: 'finnhub' | 'upstox' | 'twelveData';
  instrumentKey?: string;
};

export type PriceData = {
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  sourceCurrency?: CurrencyCode;
  monetary?: {
    currentPrice?: ConvertedMonetaryValue;
    change?: ConvertedMonetaryValue;
    high?: ConvertedMonetaryValue;
    low?: ConvertedMonetaryValue;
    open?: ConvertedMonetaryValue;
    previousClose?: ConvertedMonetaryValue;
  };
};

export type CompanyProfile = {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  marketCapitalization: number | null;
  currency: string;
  country: string;
  ipo: string;
  logo: string;
  weburl: string;
  isin?: string;
  description?: string;
  sector?: string;
  instrumentKey?: string;
  marketCapitalizationMoney?: ConvertedMonetaryValue;
  sectorMarketCapitalization?: ConvertedMonetaryValue & { unit: 'crore' };
};

export type MetricProvenance = {
  source: 'provider' | 'derived';
  derivation?: string;
};

export type BenchmarkMetric = {
  value: number | null;
  sectorBenchmark: number | null;
};

export type SectionAvailability = {
  status: 'available' | 'unavailable' | 'not-supported';
  message?: string;
};

export type ValuationMetrics = {
  peRatio?: BenchmarkMetric | null;
  pbRatio?: BenchmarkMetric | null;
  evToEbitda?: BenchmarkMetric | null;
  marketCapitalization?: ConvertedMonetaryValue | null;
};
export type ProfitabilityMetrics = {
  roe?: BenchmarkMetric | null;
  roa?: BenchmarkMetric | null;
  roce?: BenchmarkMetric | null;
  operatingMargin?: number | null;
  netMargin?: number | null;
};
export type FinancialHealthMetrics = Record<string, number | ConvertedMonetaryValue | null>;
export type AnnotatedMonetaryValue = ConvertedMonetaryValue & MetricProvenance;
export type AnnotatedPercentage = MetricProvenance & { value: number };

export type PerShareMetrics = {
  eps?: AnnotatedMonetaryValue | null;
  bookValuePerShare?: AnnotatedMonetaryValue | null;
  dividendPerShare?: AnnotatedMonetaryValue | null;
  faceValue?: AnnotatedMonetaryValue | null;
  dividendYield?: AnnotatedPercentage | null;
};
export type GrowthMetrics = Record<string, number | null>;
export type OwnershipMetrics = Record<string, number | null>;
export type FinancialStatements = Record<string, Array<Record<string, unknown>>>;
export type CorporateAction = Record<string, unknown>;
export type PeerData = { identity: StockIdentity } & Record<string, unknown>;

export type CompanyFundamentals = {
  identity: StockIdentity;
  businessDescription?: string;
  sector?: string;
  sectorMarketCapitalization?: ConvertedMonetaryValue & { unit: 'crore' };
  availability: SectionAvailability;
};

export type FundamentalsOverview = {
  company: CompanyFundamentals;
  valuation: ValuationMetrics;
  profitability: ProfitabilityMetrics;
  perShare: PerShareMetrics;
  valuationAvailability: SectionAvailability;
  profitabilityAvailability: SectionAvailability;
  perShareAvailability: SectionAvailability;
  availability: SectionAvailability;
};

export type StatementType = 'consolidated' | 'standalone';
export type ReportingPeriod = 'yearly' | 'quarterly';
export type StatementKind = 'income' | 'balance-sheet' | 'cash-flow';

export type StatementHistoryPoint = {
  period: string;
  amount: ConvertedMonetaryValue;
  changePercentage: number | null;
  changeSource?: 'provider' | 'derived';
};

export type StatementSeries = {
  key: string;
  label: string;
  unit: 'crore' | 'per-share';
  source?: 'provider' | 'derived';
  derivation?: string;
  history: StatementHistoryPoint[];
};

export type FinancialStatementData = {
  kind: StatementKind;
  statementType: StatementType;
  reportingPeriod: ReportingPeriod;
  sourceUnit: 'crore';
  summary: StatementSeries[];
  details: StatementSeries[];
  availability: SectionAvailability;
};

export type FinancialStatementsResearch = {
  incomeStatement: FinancialStatementData;
  balanceSheet: FinancialStatementData;
  cashFlow: FinancialStatementData;
};

export type ShareholdingCategory = {
  key: 'promoters' | 'fii' | 'other_dii' | 'mutual_funds' | 'retail_and_other';
  label: string;
  history: Array<{ period: string; value: number }>;
};

export type ShareholdingResearch = {
  categories: ShareholdingCategory[];
  availability: SectionAvailability;
};

export type CorporateActionData = {
  type: string;
  announcedAt?: string;
  effectiveAt?: string;
  recordDate?: string;
  ratio?: string;
  description?: string;
  amount?: ConvertedMonetaryValue;
  details?: Array<{ label: string; value: string }>;
};

export type CorporateActionsResearch = {
  actions: CorporateActionData[];
  availability: SectionAvailability;
};

export type CompetitorData = {
  identity: StockIdentity;
  description?: string;
  sector?: string;
  sectorMarketCapitalization?: ConvertedMonetaryValue & { unit: 'crore' };
};

export type CompetitorsResearch = {
  competitors: CompetitorData[];
  availability: SectionAvailability;
};

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
  imageUrl?: string;
  symbols?: string[];
  companyName?: string;
  exchange?: string;
  country?: string;
  sentiment?: number | null;
  publishedAt?: string;
};

export type AnalystRecommendation = {
  symbol: string;
  buy: number;
  hold: number;
  sell: number;
  period: string;
};

export type NormalizedStockData = {
  identity: StockIdentity;
  price?: PriceData;
  profile?: CompanyProfile;
  valuation?: ValuationMetrics;
  profitability?: ProfitabilityMetrics;
  financialHealth?: FinancialHealthMetrics;
  perShare?: PerShareMetrics;
  growth?: GrowthMetrics;
  ownership?: OwnershipMetrics;
  statements?: FinancialStatements;
  corporateActions?: CorporateAction[];
  peers?: PeerData[];
  news?: NewsItem[];
  recommendation?: AnalystRecommendation;
};
