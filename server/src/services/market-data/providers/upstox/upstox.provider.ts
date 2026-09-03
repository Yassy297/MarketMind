import axios from 'axios';
import { env } from '../../../../config/env';
import type { MarketRequestContext } from '../../../../types/market';
import { currencyService } from '../../../currency/currency.service';
import { MarketDataError } from '../../marketData.errors';
import type {
  AnalystRecommendation,
  CompanyProfile,
  CompetitorsResearch,
  CorporateActionsResearch,
  FinancialStatementOptions,
  FinancialStatementsResearch,
  FundamentalsOverview,
  MarketDataCapability,
  MarketDataProvider,
  NewsItem,
  PriceData,
  SearchResult,
  ShareholdingResearch
} from '../../marketData.types';
import {
  normalizeBalanceSheet,
  normalizeCashFlow,
  normalizeCompetitor,
  normalizeCorporateAction,
  normalizeFundamentalsOverview,
  normalizeIncomeStatement,
  normalizeShareholding
} from './upstox.normalizer';
import { upstoxInstrumentService } from './upstox.instrument.service';
import type {
  UpstoxApiResponse,
  UpstoxBalanceSheet,
  UpstoxCashFlow,
  UpstoxCompanyProfile,
  UpstoxCompetitor,
  UpstoxCorporateAction,
  UpstoxIncomeStatement,
  UpstoxQuote,
  UpstoxRatio,
  UpstoxShareholdingCategory
} from './upstox.types';

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const FUNDAMENTALS_TTL_MS = 4 * 60 * 60 * 1000;

const client = axios.create({
  baseURL: 'https://api.upstox.com/v2',
  timeout: 10_000,
  headers: { Accept: 'application/json' }
});

const requiredNumber = (value: number | undefined, field: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new MarketDataError('QUOTE_UNAVAILABLE', `Indian stock quote is missing ${field}.`);
  }
  return value;
};

export class UpstoxProvider implements MarketDataProvider {
  readonly name = 'upstox' as const;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly pending = new Map<string, Promise<unknown>>();

  isConfigured(): boolean {
    return Boolean(env.upstoxAccessToken);
  }

  supports(capability: MarketDataCapability): boolean {
    return [
      'search',
      'profile',
      'quote',
      'fundamentals',
      'ratios',
      'financialStatements',
      'shareholding',
      'corporateActions',
      'competitors'
    ].includes(capability);
  }

  async search(query: string, context: MarketRequestContext): Promise<SearchResult[]> {
    return upstoxInstrumentService.search(query, context.market === 'IN');
  }

  async getProfile(symbol: string, context: MarketRequestContext): Promise<CompanyProfile> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    const profile = await this.loadFundamental<UpstoxCompanyProfile>(
      instrument.isin!,
      'profile'
    ).catch(() => undefined);
    const sectorCap = profile?.sector_market_cap_inr?.value;

    return {
      name: instrument.companyName,
      ticker: instrument.displaySymbol,
      exchange: instrument.exchange ?? '',
      industry: '',
      marketCapitalization: null,
      currency: 'INR',
      country: 'India',
      ipo: '',
      logo: '',
      weburl: '',
      isin: instrument.isin ?? undefined,
      description: profile?.company_profile,
      sector: profile?.sector || undefined,
      instrumentKey: instrument.providerInstrumentKey,
      sectorMarketCapitalization:
        typeof sectorCap === 'number'
          ? { ...(await currencyService.convert({ value: sectorCap, sourceCurrency: 'INR' }, context.displayCurrency ?? 'INR')), unit: 'crore' }
          : undefined,
      availability: {
        profile: 'available',
        fundamentals: profile ? 'available' : 'unavailable'
      }
    };
  }

  async getQuote(symbol: string, _context: MarketRequestContext): Promise<PriceData> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    try {
      const { data } = await client.get<UpstoxApiResponse<Record<string, UpstoxQuote>>>(
        '/market-quote/quotes',
        {
          headers: this.authorizationHeaders(),
          params: { instrument_key: instrument.providerInstrumentKey }
        }
      );
      const quote = Object.values(data.data ?? {})[0];
      if (!quote) {
        throw new MarketDataError('QUOTE_UNAVAILABLE', 'Indian stock quote is unavailable.');
      }
      const currentPrice = requiredNumber(quote.last_price, 'last price');
      const previousClose = requiredNumber(quote.ohlc?.close, 'previous close');
      const change = requiredNumber(quote.net_change, 'net change');
      return {
        currentPrice,
        change,
        percentChange: previousClose === 0 ? 0 : (change / previousClose) * 100,
        high: requiredNumber(quote.ohlc?.high, 'day high'),
        low: requiredNumber(quote.ohlc?.low, 'day low'),
        open: requiredNumber(quote.ohlc?.open, 'open price'),
        previousClose,
        timestamp: quote.timestamp ? Date.parse(quote.timestamp) : Date.now(),
        sourceCurrency: 'INR'
      };
    } catch (error) {
      this.throwProviderError(error, 'QUOTE_UNAVAILABLE', 'Indian stock quote is currently unavailable.');
    }
  }

  async getNews(_symbol: string, _context: MarketRequestContext): Promise<NewsItem[]> {
    throw new MarketDataError(
      'MARKET_PROVIDER_UNAVAILABLE',
      'Indian stock news is not available from this provider.'
    );
  }

  async getRecommendation(
    _symbol: string,
    _context: MarketRequestContext
  ): Promise<AnalystRecommendation> {
    throw new MarketDataError(
      'MARKET_PROVIDER_UNAVAILABLE',
      'Indian analyst recommendations are not available from this provider.'
    );
  }

  async getFundamentals(
    symbol: string,
    context: MarketRequestContext
  ): Promise<FundamentalsOverview> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    const isin = instrument.isin!;
    const [profile, ratios, income, actions, quote] = await Promise.allSettled([
      this.loadFundamental<UpstoxCompanyProfile>(isin, 'profile'),
      this.loadFundamental<UpstoxRatio[]>(isin, 'key-ratios'),
      this.loadFundamental<UpstoxIncomeStatement>(isin, 'income-statement', {
        type: 'consolidated',
        time_period: 'yearly',
        fs: true
      }),
      this.loadFundamental<UpstoxCorporateAction[]>(isin, 'corporate-actions'),
      this.getQuote(symbol, context)
    ]);

    return normalizeFundamentalsOverview(
      instrument,
      profile.status === 'fulfilled' ? profile.value : undefined,
      ratios.status === 'fulfilled' ? ratios.value : undefined,
      income.status === 'fulfilled' ? income.value : undefined,
      actions.status === 'fulfilled' ? actions.value : undefined,
      quote.status === 'fulfilled' ? quote.value : undefined,
      context
    );
  }

  async getFinancialStatements(
    symbol: string,
    context: MarketRequestContext,
    options: FinancialStatementOptions
  ): Promise<FinancialStatementsResearch> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    const isin = instrument.isin!;
    const commonParams = { type: options.statementType, fs: true };
    const [income, balance, cashFlow] = await Promise.allSettled([
      this.loadFundamental<UpstoxIncomeStatement>(isin, 'income-statement', {
        ...commonParams,
        time_period: options.reportingPeriod
      }),
      this.loadFundamental<UpstoxBalanceSheet>(isin, 'balance-sheet', commonParams),
      this.loadFundamental<UpstoxCashFlow>(isin, 'cash-flow', commonParams)
    ]);

    return {
      incomeStatement: await normalizeIncomeStatement(
        income.status === 'fulfilled' ? income.value : undefined,
        options.statementType,
        options.reportingPeriod,
        context
      ),
      balanceSheet: await normalizeBalanceSheet(
        balance.status === 'fulfilled' ? balance.value : undefined,
        options.statementType,
        context
      ),
      cashFlow: await normalizeCashFlow(
        cashFlow.status === 'fulfilled' ? cashFlow.value : undefined,
        options.statementType,
        context
      )
    };
  }

  async getShareholding(
    symbol: string,
    _context: MarketRequestContext
  ): Promise<ShareholdingResearch> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    const holdings = await this.loadFundamental<UpstoxShareholdingCategory[]>(
      instrument.isin!,
      'share-holdings'
    ).catch(() => undefined);
    const categories = normalizeShareholding(holdings);
    return {
      categories,
      availability: {
        status: categories.length ? 'available' : 'unavailable',
        message: categories.length ? undefined : 'Shareholding data is unavailable.'
      }
    };
  }

  async getCorporateActions(
    symbol: string,
    context: MarketRequestContext
  ): Promise<CorporateActionsResearch> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    const rawActions = await this.loadFundamental<UpstoxCorporateAction[]>(
      instrument.isin!,
      'corporate-actions'
    ).catch(() => undefined);
    if (!rawActions) {
      return {
        actions: [],
        availability: {
          status: 'unavailable',
          message: 'Corporate actions are unavailable.'
        }
      };
    }
    const actions = await Promise.all(
      rawActions.map((action) => normalizeCorporateAction(action, context))
    );
    actions.sort(
      (left, right) =>
        (Date.parse(right.effectiveAt ?? right.announcedAt ?? '') || 0) -
        (Date.parse(left.effectiveAt ?? left.announcedAt ?? '') || 0)
    );
    return {
      actions,
      availability: {
        status: 'available'
      }
    };
  }

  async getCompetitors(
    symbol: string,
    context: MarketRequestContext
  ): Promise<CompetitorsResearch> {
    const instrument = await upstoxInstrumentService.resolve(symbol);
    const rawCompetitors = await this.loadFundamental<UpstoxCompetitor[]>(
      instrument.providerInstrumentKey!,
      'competitors'
    ).catch(() => undefined);
    if (!rawCompetitors) {
      return {
        competitors: [],
        availability: {
          status: 'unavailable',
          message: 'Competitor data is unavailable.'
        }
      };
    }
    const competitors = await Promise.all(
      rawCompetitors.map(async (competitor) => {
        const isin = competitor.instrument_key?.split('|')[1];
        const resolved = isin
          ? await upstoxInstrumentService.resolveByIsin(isin).catch(() => undefined)
          : undefined;
        return normalizeCompetitor(competitor, resolved, context);
      })
    );
    return {
      competitors,
      availability: {
        status: competitors.length ? 'available' : 'unavailable',
        message: competitors.length ? undefined : 'Competitor data is unavailable.'
      }
    };
  }

  private async loadFundamental<T>(
    isin: string,
    resource: string,
    params?: Record<string, string | boolean>
  ): Promise<T> {
    this.assertConfigured();
    const paramsKey = params
      ? Object.entries(params)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    const cacheKey = `${isin}:${resource}:${paramsKey}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;

    const existing = this.pending.get(cacheKey);
    if (existing) return existing as Promise<T>;

    const request = this.requestFundamental<T>(isin, resource, params)
      .then((value) => {
        this.cache.set(cacheKey, {
          value,
          expiresAt: Date.now() + FUNDAMENTALS_TTL_MS
        });
        return value;
      })
      .finally(() => this.pending.delete(cacheKey));
    this.pending.set(cacheKey, request);
    return request;
  }

  private async requestFundamental<T>(
    isin: string,
    resource: string,
    params?: Record<string, string | boolean>
  ): Promise<T> {
    try {
      const { data } = await client.get<UpstoxApiResponse<T>>(
        `/fundamentals/${encodeURIComponent(isin)}/${resource}`,
        { headers: this.authorizationHeaders(), params }
      );
      if (data.data === undefined) {
        throw new MarketDataError('FUNDAMENTALS_UNAVAILABLE', 'Company fundamentals are unavailable.');
      }
      return data.data;
    } catch (error) {
      console.warn('Upstox fundamentals section unavailable.', {
        resource,
        status: axios.isAxiosError(error) ? error.response?.status : undefined
      });
      this.throwProviderError(
        error,
        'FUNDAMENTALS_UNAVAILABLE',
        'Company fundamentals are unavailable.'
      );
    }
  }

  private authorizationHeaders() {
    this.assertConfigured();
    return { Authorization: `Bearer ${env.upstoxAccessToken}` };
  }

  private assertConfigured() {
    if (!env.upstoxAccessToken) {
      throw new MarketDataError(
        'MARKET_PROVIDER_UNAVAILABLE',
        'Indian market data is not configured.'
      );
    }
  }

  private throwProviderError(
    error: unknown,
    code: 'QUOTE_UNAVAILABLE' | 'FUNDAMENTALS_UNAVAILABLE',
    message: string
  ): never {
    if (error instanceof MarketDataError) throw error;
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      throw new MarketDataError(
        'PROVIDER_AUTHENTICATION_FAILED',
        'Indian market data authentication is currently unavailable.'
      );
    }
    throw new MarketDataError(code, message);
  }
}

export const upstoxProvider = new UpstoxProvider();
