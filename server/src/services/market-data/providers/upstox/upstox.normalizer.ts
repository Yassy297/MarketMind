import type { MarketRequestContext } from '../../../../types/market';
import { currencyService } from '../../../currency/currency.service';
import type {
  BenchmarkMetric,
  AnnotatedMonetaryValue,
  CompanyFundamentals,
  CorporateAction,
  FinancialStatementData,
  FundamentalsOverview,
  PeerData,
  PriceData,
  SearchResult,
  ShareholdingCategory,
  StatementHistoryPoint,
  StatementSeries,
  StatementType,
  ReportingPeriod
} from '../../marketData.types';
import type {
  UpstoxBalanceSheet,
  UpstoxCashFlow,
  UpstoxCategorySeries,
  UpstoxCompanyProfile,
  UpstoxCompetitor,
  UpstoxCorporateAction,
  UpstoxDetailedSeries,
  UpstoxHistoryPoint,
  UpstoxIncomeStatement,
  UpstoxRatio,
  UpstoxShareholdingCategory
} from './upstox.types';

const DISPLAY_CURRENCY = (context: MarketRequestContext) => context.displayCurrency ?? 'INR';

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/[%+,]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const keyFor = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_match, next: string) => next.toUpperCase());

const labelForCategory = (category: string) => {
  const labels: Record<string, string> = {
    revenue: 'Revenue',
    operating_profit: 'Operating Profit',
    net_profit: 'Net Profit',
    operating: 'Operating Cash Flow',
    investing: 'Investing Cash Flow',
    financing: 'Financing Cash Flow'
  };
  return labels[category] ?? category.replace(/_/g, ' ');
};

const convertValue = (value: number, context: MarketRequestContext) =>
  currencyService.convert({ value, sourceCurrency: 'INR' }, DISPLAY_CURRENCY(context));

const normalizeHistory = async (
  history: UpstoxHistoryPoint[] | undefined,
  context: MarketRequestContext,
  changeSource: 'provider' | 'derived' = 'provider'
): Promise<StatementHistoryPoint[]> => {
  const points = (history ?? []).filter(
    (point): point is UpstoxHistoryPoint & { value: number; period: string } =>
      typeof point.value === 'number' && Boolean(point.period)
  );

  return Promise.all(
    points.map(async (point, index) => {
      let changePercentage = parseNumber(point.change);
      let source: 'provider' | 'derived' | undefined = changePercentage === null ? undefined : changeSource;
      if (changeSource === 'derived' && changePercentage === null) {
        const previous = points[index + 1]?.value;
        if (typeof previous === 'number' && previous !== 0) {
          changePercentage = ((point.value - previous) / Math.abs(previous)) * 100;
          source = 'derived';
        }
      }
      return {
        period: point.period,
        amount: await convertValue(point.value, context),
        changePercentage,
        changeSource: source
      };
    })
  );
};

const normalizeCategorySeries = async (
  series: UpstoxCategorySeries[] | undefined,
  context: MarketRequestContext
): Promise<StatementSeries[]> =>
  Promise.all(
    (series ?? [])
      .filter((item): item is UpstoxCategorySeries & { category: string } => Boolean(item.category))
      .map(async (item) => ({
        key: keyFor(item.category),
        label: labelForCategory(item.category),
        unit: 'crore' as const,
        history: await normalizeHistory(item.history, context)
      }))
  );

const normalizeDetails = async (
  details: UpstoxDetailedSeries[] | undefined,
  context: MarketRequestContext
): Promise<StatementSeries[]> =>
  Promise.all(
    (details ?? [])
      .filter((item): item is UpstoxDetailedSeries & { particular: string } => Boolean(item.particular))
      .map(async (item) => ({
        key: keyFor(item.particular),
        label: item.particular,
        unit: item.particular.toLowerCase().startsWith('eps') ? 'per-share' as const : 'crore' as const,
        history: await normalizeHistory(item.history, context)
      }))
  );

const metric = (ratios: UpstoxRatio[], name: string): BenchmarkMetric => {
  const ratio = ratios.find((item) => item.name === name);
  return {
    value: parseNumber(ratio?.company_value),
    sectorBenchmark: parseNumber(ratio?.sector_value)
  };
};

export const normalizeCompanyFundamentals = async (
  instrument: SearchResult,
  profile: UpstoxCompanyProfile | undefined,
  context: MarketRequestContext
): Promise<CompanyFundamentals> => {
  const sectorCap = profile?.sector_market_cap_inr?.value;
  return {
    identity: {
      symbol: instrument.symbol,
      displaySymbol: instrument.displaySymbol,
      name: instrument.companyName,
      market: 'IN',
      exchange: instrument.exchange ?? undefined,
      instrumentType: instrument.instrumentType ?? undefined,
      isin: instrument.isin ?? undefined,
      countryCode: 'IN',
      currency: 'INR',
      provider: 'upstox',
      instrumentKey: instrument.providerInstrumentKey
    },
    businessDescription: profile?.company_profile || undefined,
    sector: profile?.sector || undefined,
    sectorMarketCapitalization:
      typeof sectorCap === 'number'
        ? { ...(await convertValue(sectorCap, context)), unit: 'crore' }
        : undefined,
    availability: {
      status: profile ? 'available' : 'unavailable',
      message: profile ? undefined : 'Company fundamentals profile is unavailable.'
    }
  };
};

const latestDetailValue = (statement: UpstoxIncomeStatement | undefined, label: string) =>
  statement?.full_statement
    ?.find((item) => item.particular?.toLowerCase() === label.toLowerCase())
    ?.history?.find((point) => typeof point.value === 'number')?.value;

const annotateMoney = async (
  value: number | null | undefined,
  context: MarketRequestContext,
  source: 'provider' | 'derived',
  derivation?: string
): Promise<AnnotatedMonetaryValue | null> => {
  if (typeof value !== 'number') return null;
  return {
    ...(await convertValue(value, context)),
    source,
    derivation
  };
};

const latestDividend = (actions: UpstoxCorporateAction[] | undefined) => {
  const dividend = (actions ?? []).find(
    (action) => action.name?.toLowerCase() === 'dividend' && typeof action.amount === 'number'
  );
  if (!dividend || typeof dividend.amount !== 'number') return undefined;
  const percent = parseNumber(
    dividend.event_details?.find((detail) => detail.name?.toLowerCase() === 'dividend %')?.value
  );
  return { amount: dividend.amount, percent };
};

export const normalizeFundamentalsOverview = async (
  instrument: SearchResult,
  profile: UpstoxCompanyProfile | undefined,
  ratios: UpstoxRatio[] | undefined,
  incomeStatement: UpstoxIncomeStatement | undefined,
  actions: UpstoxCorporateAction[] | undefined,
  quote: PriceData | undefined,
  context: MarketRequestContext
): Promise<FundamentalsOverview> => {
  const ratioItems = ratios ?? [];
  const basicEps = latestDetailValue(incomeStatement, 'EPS - Basic');
  const pb = metric(ratioItems, 'P/B');
  const dividend = latestDividend(actions);
  const bookValue =
    quote && typeof pb.value === 'number' && pb.value !== 0
      ? quote.currentPrice / pb.value
      : null;
  const faceValue =
    dividend && typeof dividend.percent === 'number' && dividend.percent !== 0
      ? dividend.amount / (dividend.percent / 100)
      : null;
  const dividendYield =
    quote && dividend && quote.currentPrice !== 0
      ? (dividend.amount / quote.currentPrice) * 100
      : null;

  const perShare = {
    eps: await annotateMoney(basicEps, context, 'provider'),
    bookValuePerShare: await annotateMoney(
      bookValue,
      context,
      'derived',
      'Current price divided by the provider P/B ratio.'
    ),
    dividendPerShare: await annotateMoney(dividend?.amount, context, 'provider'),
    faceValue: await annotateMoney(
      faceValue,
      context,
      'derived',
      'Latest dividend amount divided by the reported dividend percentage.'
    ),
    dividendYield:
      typeof dividendYield === 'number'
        ? {
            value: dividendYield,
            source: 'derived' as const,
            derivation: 'Latest dividend amount divided by the current share price.'
          }
        : null
  };

  const hasPerShare = Object.values(perShare).some((value) => value !== null);

  return {
    company: await normalizeCompanyFundamentals(instrument, profile, context),
    valuation: {
      peRatio: metric(ratioItems, 'P/E'),
      pbRatio: pb,
      evToEbitda: metric(ratioItems, 'EV/EBITDA'),
      marketCapitalization: null
    },
    profitability: {
      roe: metric(ratioItems, 'ROE'),
      roa: metric(ratioItems, 'ROA'),
      roce: metric(ratioItems, 'ROCE')
    },
    perShare,
    valuationAvailability: {
      status: ratios ? 'available' : 'unavailable',
      message: ratios ? undefined : 'Valuation ratios are unavailable.'
    },
    profitabilityAvailability: {
      status: ratios ? 'available' : 'unavailable',
      message: ratios ? undefined : 'Profitability ratios are unavailable.'
    },
    perShareAvailability: {
      status: hasPerShare ? 'available' : 'unavailable',
      message: hasPerShare ? undefined : 'Per-share metrics are unavailable.'
    },
    availability: {
      status: profile || ratios || incomeStatement || actions ? 'available' : 'unavailable',
      message:
        profile || ratios || incomeStatement || actions
          ? undefined
          : 'Fundamentals are unavailable for this instrument.'
    }
  };
};

export const normalizeIncomeStatement = async (
  raw: UpstoxIncomeStatement | undefined,
  statementType: StatementType,
  reportingPeriod: ReportingPeriod,
  context: MarketRequestContext
): Promise<FinancialStatementData> => ({
  kind: 'income',
  statementType,
  reportingPeriod,
  sourceUnit: 'crore',
  summary: await normalizeCategorySeries(raw?.income_statement, context),
  details: await normalizeDetails(raw?.full_statement, context),
  availability: {
    status: raw ? 'available' : 'unavailable',
    message: raw ? undefined : 'Income statement is unavailable.'
  }
});

const detailSeries = (details: UpstoxDetailedSeries[] | undefined, label: string) =>
  details?.find((item) => item.particular?.toLowerCase() === label.toLowerCase());

export const normalizeBalanceSheet = async (
  raw: UpstoxBalanceSheet | undefined,
  statementType: StatementType,
  context: MarketRequestContext
): Promise<FinancialStatementData> => {
  const history = raw?.history ?? [];
  const totalAssets = history.map((point) => ({
    period: point.period,
    value: point.total_asset
  }));
  const totalLiabilities = history.map((point) => ({
    period: point.period,
    value: point.total_liability
  }));
  const equityFromDetails = detailSeries(raw?.full_statement, 'Equity Capital');
  const derivedEquity = history
    .filter(
      (point): point is typeof point & { period: string; total_asset: number; total_liability: number } =>
        Boolean(point.period) &&
        typeof point.total_asset === 'number' &&
        typeof point.total_liability === 'number'
    )
    .map((point) => ({
      period: point.period,
      value: point.total_asset - point.total_liability
    }));
  const summary: StatementSeries[] = [
    {
      key: 'totalAssets',
      label: 'Total Assets',
      unit: 'crore',
      source: 'provider',
      history: await normalizeHistory(totalAssets, context, 'derived')
    },
    {
      key: 'totalLiabilities',
      label: 'Total Liabilities',
      unit: 'crore',
      source: 'provider',
      history: await normalizeHistory(totalLiabilities, context, 'derived')
    }
  ];
  if (equityFromDetails?.history?.length) {
    summary.push({
      key: 'equityCapital',
      label: 'Equity Capital',
      unit: 'crore',
      source: 'provider',
      history: await normalizeHistory(equityFromDetails.history, context, 'derived')
    });
  } else if (derivedEquity.length) {
    summary.push({
      key: 'shareholdersEquity',
      label: "Shareholders' equity",
      unit: 'crore',
      source: 'derived',
      derivation: 'Total assets minus total liabilities for the same reporting period.',
      history: await normalizeHistory(derivedEquity, context, 'derived')
    });
  }
  return {
    kind: 'balance-sheet',
    statementType,
    reportingPeriod: 'yearly',
    sourceUnit: 'crore',
    summary,
    details: await normalizeDetails(raw?.full_statement, context),
    availability: {
      status: raw ? 'available' : 'unavailable',
      message: raw ? undefined : 'Balance sheet is unavailable.'
    }
  };
};

export const normalizeCashFlow = async (
  raw: UpstoxCashFlow | undefined,
  statementType: StatementType,
  context: MarketRequestContext
): Promise<FinancialStatementData> => {
  const summary = await normalizeCategorySeries(raw?.cash_flow, context);
  const yearEndCash = detailSeries(raw?.full_statement, 'Cash (End of the year)');
  if (yearEndCash?.history?.length) {
    summary.push({
      key: 'cashEndOfYear',
      label: 'Cash (end of year)',
      unit: 'crore',
      source: 'provider',
      history: await normalizeHistory(yearEndCash.history, context, 'derived')
    });
  }
  return {
    kind: 'cash-flow',
    statementType,
    reportingPeriod: 'yearly',
    sourceUnit: 'crore',
    summary,
    details: await normalizeDetails(raw?.full_statement, context),
    availability: {
      status: raw ? 'available' : 'unavailable',
      message: raw ? undefined : 'Cash flow statement is unavailable.'
    }
  };
};

const SHAREHOLDING_LABELS: Record<ShareholdingCategory['key'], string> = {
  promoters: 'Promoters',
  fii: 'FII',
  other_dii: 'Other DII',
  mutual_funds: 'Mutual Funds',
  retail_and_other: 'Retail & Other'
};

export const normalizeShareholding = (
  raw: UpstoxShareholdingCategory[] | undefined
): ShareholdingCategory[] =>
  (raw ?? [])
    .filter(
      (item): item is UpstoxShareholdingCategory & { category: ShareholdingCategory['key'] } =>
        Boolean(item.category && item.category in SHAREHOLDING_LABELS)
    )
    .map((item) => ({
      key: item.category,
      label: SHAREHOLDING_LABELS[item.category],
      history: (item.history ?? []).filter(
        (point): point is UpstoxHistoryPoint & { period: string; value: number } =>
          Boolean(point.period) && typeof point.value === 'number'
      ).map((point) => ({ period: point.period, value: point.value }))
    }));

const detailValue = (details: UpstoxCorporateAction['event_details'], label: string) =>
  details?.find((detail) => detail.name?.toLowerCase() === label.toLowerCase())?.value;

export const normalizeCorporateAction = async (
  action: UpstoxCorporateAction,
  context: MarketRequestContext
): Promise<CorporateAction> => ({
  type: action.name || 'Corporate action',
  announcedAt: detailValue(action.event_details, 'Announcement date'),
  effectiveAt:
    detailValue(action.event_details, 'Ex dividend date') ??
    detailValue(action.event_details, 'Ex date') ??
    action.expiry_date,
  recordDate: detailValue(action.event_details, 'Record date'),
  ratio: action.ratio || undefined,
  description: detailValue(action.event_details, 'Details'),
  amount:
    typeof action.amount === 'number'
      ? await convertValue(action.amount, context)
      : undefined,
  details: (action.event_details ?? [])
    .filter((detail): detail is { name: string; value: string } =>
      Boolean(detail.name && detail.value)
    )
    .map((detail) => ({ label: detail.name, value: detail.value }))
});

export const normalizeCompetitor = async (
  raw: UpstoxCompetitor,
  instrument: SearchResult | undefined,
  context: MarketRequestContext
): Promise<PeerData> => {
  const isin = raw.instrument_key?.includes('|') ? raw.instrument_key.split('|')[1] : undefined;
  const sectorCap = raw.sector_market_cap_inr?.value;
  return {
    identity: {
      symbol: instrument?.symbol ?? isin ?? '',
      displaySymbol: instrument?.displaySymbol ?? isin ?? '',
      name: instrument?.companyName ?? '',
      market: 'IN',
      exchange: instrument?.exchange ?? undefined,
      isin,
      countryCode: 'IN',
      currency: 'INR',
      provider: 'upstox',
      instrumentKey: raw.instrument_key
    },
    description: raw.company_profile || undefined,
    sector: raw.sector || undefined,
    sectorMarketCapitalization:
      typeof sectorCap === 'number'
        ? { ...(await convertValue(sectorCap, context)), unit: 'crore' }
        : undefined
  };
};
