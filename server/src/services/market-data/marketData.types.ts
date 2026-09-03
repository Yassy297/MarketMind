import type { CountryCode, CurrencyCode, MarketCode, MarketRequestContext } from '../../types/market';
import type { NewsItem } from '../news/news.types';

export type { NewsItem } from '../news/news.types';

export type FinancialFieldKind = 'monetary' | 'percentage' | 'ratio' | 'count' | 'text' | 'date';

export type MonetaryValue = {
  value: number;
  sourceCurrency: CurrencyCode;
};

export type ConvertedMonetaryValue = MonetaryValue & {
  displayCurrency: CurrencyCode;
  convertedValue: number | null;
  conversionStatus: 'not-required' | 'converted' | 'unavailable';
};

export const FINANCIAL_FIELD_METADATA = {
  currentPrice: 'monetary',
  marketCapitalization: 'monetary',
  revenue: 'monetary',
  ebitda: 'monetary',
  operatingProfit: 'monetary',
  netIncome: 'monetary',
  totalAssets: 'monetary',
  liabilities: 'monetary',
  debt: 'monetary',
  cash: 'monetary',
  bookValuePerShare: 'monetary',
  dividendAmount: 'monetary',
  eps: 'monetary',
  peRatio: 'ratio',
  pbRatio: 'ratio',
  roe: 'percentage',
  roa: 'percentage',
  roce: 'percentage',
  evToEbitda: 'ratio',
  debtToEquity: 'ratio',
  currentRatio: 'ratio',
  margin: 'percentage',
  growth: 'percentage',
  shareholding: 'percentage',
  employeeCount: 'count',
  companyName: 'text',
  reportingDate: 'date'
} as const satisfies Record<string, FinancialFieldKind>;

export type StockIdentity = {
  symbol: string;
  displaySymbol: string;
  name: string;
  market?: MarketCode;
  exchange?: string;
  instrumentType?: string;
  isin?: string;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
  provider?: 'finnhub' | 'upstox' | 'twelveData';
  instrumentKey?: string;
};

export type SearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
  companyName: string;
  exchange: string | null;
  exchangeCode: string | null;
  market: MarketCode | null;
  countryCode: CountryCode | null;
  countryName: string | null;
  currency: CurrencyCode | null;
  isin: string | null;
  instrumentType: string | null;
  provider: 'finnhub' | 'upstox' | 'twelveData';
  providerInstrumentKey?: string;
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
  availability?: {
    profile: 'available' | 'unavailable';
    fundamentals: 'available' | 'unavailable';
  };
  marketCapitalizationMoney?: ConvertedMonetaryValue;
  sectorMarketCapitalization?: ConvertedMonetaryValue & { unit: 'crore' };
};

export type MetricProvenance = {
  source: 'provider' | 'derived';
  derivation?: string;
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

export type FinancialHealthMetrics = {
  debtToEquity?: number | null;
  currentRatio?: number | null;
  debt?: ConvertedMonetaryValue | null;
  cash?: ConvertedMonetaryValue | null;
};

export type AnnotatedMonetaryValue = ConvertedMonetaryValue & MetricProvenance;

export type AnnotatedPercentage = MetricProvenance & {
  value: number;
};

export type PerShareMetrics = {
  eps?: AnnotatedMonetaryValue | null;
  bookValuePerShare?: AnnotatedMonetaryValue | null;
  dividendPerShare?: AnnotatedMonetaryValue | null;
  faceValue?: AnnotatedMonetaryValue | null;
  dividendYield?: AnnotatedPercentage | null;
};

export type GrowthMetrics = {
  revenueGrowth?: number | null;
  earningsGrowth?: number | null;
};

export type OwnershipMetrics = {
  promoterHolding?: number | null;
  institutionalHolding?: number | null;
  publicHolding?: number | null;
};

export type BenchmarkMetric = {
  value: number | null;
  sectorBenchmark: number | null;
};

export type AvailabilityStatus = 'available' | 'unavailable' | 'not-supported';

export type SectionAvailability = {
  status: AvailabilityStatus;
  message?: string;
};

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

export type FinancialStatementOptions = {
  statementType: StatementType;
  reportingPeriod: ReportingPeriod;
};

export type FinancialStatementsResearch = {
  incomeStatement: FinancialStatementData;
  balanceSheet: FinancialStatementData;
  cashFlow: FinancialStatementData;
};

export type ShareholdingHistoryPoint = {
  period: string;
  value: number;
};

export type ShareholdingCategory = {
  key: 'promoters' | 'fii' | 'other_dii' | 'mutual_funds' | 'retail_and_other';
  label: string;
  history: ShareholdingHistoryPoint[];
};

export type ShareholdingResearch = {
  categories: ShareholdingCategory[];
  availability: SectionAvailability;
};

export type FinancialStatement = {
  period: string;
  currency: CurrencyCode;
  values: Record<string, ConvertedMonetaryValue | number | string | null>;
};

export type FinancialStatements = {
  incomeStatement?: FinancialStatement[];
  balanceSheet?: FinancialStatement[];
  cashFlow?: FinancialStatement[];
};

export type CorporateAction = {
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
  actions: CorporateAction[];
  availability: SectionAvailability;
};

export type PeerData = {
  identity: StockIdentity;
  description?: string;
  sector?: string;
  sectorMarketCapitalization?: ConvertedMonetaryValue & { unit: 'crore' };
};

export type CompetitorsResearch = {
  competitors: PeerData[];
  availability: SectionAvailability;
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

export type MarketDataCapability =
  | 'search'
  | 'profile'
  | 'quote'
  | 'news'
  | 'recommendation'
  | 'fundamentals'
  | 'ratios'
  | 'financialStatements'
  | 'shareholding'
  | 'corporateActions'
  | 'competitors';

export interface MarketDataProvider {
  readonly name: 'finnhub' | 'upstox' | 'twelveData';
  isConfigured(): boolean;
  supports(capability: MarketDataCapability): boolean;
  search(query: string, context: MarketRequestContext): Promise<SearchResult[]>;
  getProfile(symbol: string, context: MarketRequestContext): Promise<CompanyProfile>;
  getQuote(symbol: string, context: MarketRequestContext): Promise<PriceData>;
  getNews(symbol: string, context: MarketRequestContext): Promise<NewsItem[]>;
  getRecommendation(symbol: string, context: MarketRequestContext): Promise<AnalystRecommendation>;
  getFundamentals?(symbol: string, context: MarketRequestContext): Promise<FundamentalsOverview>;
  getFinancialStatements?(
    symbol: string,
    context: MarketRequestContext,
    options: FinancialStatementOptions
  ): Promise<FinancialStatementsResearch>;
  getShareholding?(symbol: string, context: MarketRequestContext): Promise<ShareholdingResearch>;
  getCorporateActions?(symbol: string, context: MarketRequestContext): Promise<CorporateActionsResearch>;
  getCompetitors?(symbol: string, context: MarketRequestContext): Promise<CompetitorsResearch>;
}
