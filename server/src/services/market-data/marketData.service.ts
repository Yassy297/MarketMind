import { isCurrencyCode, MARKET_CONFIG } from '../../config/markets';
import type { MarketCode, MarketRequestContext } from '../../types/market';
import { currencyService } from '../currency/currency.service';
import { marketDataProviderResolver } from './marketData.providerResolver';
import { instrumentSearchService } from './instrumentSearch.service';
import type {
  AnalystRecommendation,
  CompetitorsResearch,
  CompanyProfile,
  CorporateActionsResearch,
  FinancialStatementData,
  FinancialStatementOptions,
  FinancialStatementsResearch,
  FundamentalsOverview,
  MarketDataProvider,
  NewsItem,
  NormalizedStockData,
  PriceData,
  SearchResult,
  ShareholdingResearch,
  StatementKind
} from './marketData.types';
import { MarketDataError } from './marketData.errors';

export class MarketDataService {
  private readonly profileCache = new Map<string, { profile: CompanyProfile; expiresAt: number }>();
  private readonly pendingProfiles = new Map<string, Promise<CompanyProfile>>();

  async search(query: string, context: MarketRequestContext = {}): Promise<SearchResult[]> {
    return instrumentSearchService.search(query, context);
  }

  /**
   * Try multiple providers in order, falling back to next if one fails
   */
  private async tryProvidersInFallback<T>(
    capability: 'profile' | 'quote' | 'recommendation',
    market: MarketCode | undefined,
    execute: (provider: MarketDataProvider) => Promise<T>
  ): Promise<T> {
    const providers = marketDataProviderResolver.resolveAll(market, capability);
    
    if (providers.length === 0) {
      throw new MarketDataError(
        'MARKET_PROVIDER_UNAVAILABLE',
        `No providers available for ${capability}.`
      );
    }

    let lastError: Error | undefined;
    for (const provider of providers) {
      try {
        return await execute(provider);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    if (lastError instanceof MarketDataError) {
      throw lastError;
    }
    throw new MarketDataError(
      'TEMPORARY_PROVIDER_ERROR',
      `Unable to fetch ${capability} data. All providers failed.`
    );
  }

  async getProfile(symbol: string, context: MarketRequestContext = {}): Promise<CompanyProfile> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const profile = {
      ...(await this.tryProvidersInFallback('profile', resolvedContext.market, (provider) =>
        this.loadProviderProfile(provider, symbol, resolvedContext)
      ))
    };

    if (
      resolvedContext.displayCurrency &&
      isCurrencyCode(profile.currency) &&
      profile.marketCapitalization
    ) {
      profile.marketCapitalizationMoney = await currencyService.convert(
        { value: profile.marketCapitalization, sourceCurrency: profile.currency },
        resolvedContext.displayCurrency
      );
    }

    return profile;
  }

  async getQuote(symbol: string, context: MarketRequestContext = {}): Promise<PriceData> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const [price, profile] = await Promise.all([
      this.tryProvidersInFallback<PriceData>('quote', resolvedContext.market, (provider) =>
        provider.getQuote(symbol, resolvedContext)
      ),
      this.tryProvidersInFallback('profile', resolvedContext.market, (provider) =>
        this.loadProviderProfile(provider, symbol, resolvedContext)
      ).catch(() => undefined)
    ]);
    const sourceCurrency = price.sourceCurrency ?? profile?.currency;

    if (isCurrencyCode(sourceCurrency)) {
      const displayCurrency = resolvedContext.displayCurrency ?? sourceCurrency;
      const [currentPrice, change, high, low, open, previousClose] = await Promise.all([
        currencyService.convert({ value: price.currentPrice, sourceCurrency }, displayCurrency),
        currencyService.convert({ value: price.change, sourceCurrency }, displayCurrency),
        currencyService.convert({ value: price.high, sourceCurrency }, displayCurrency),
        currencyService.convert({ value: price.low, sourceCurrency }, displayCurrency),
        currencyService.convert({ value: price.open, sourceCurrency }, displayCurrency),
        currencyService.convert({ value: price.previousClose, sourceCurrency }, displayCurrency)
      ]);
      price.sourceCurrency = sourceCurrency;
      price.monetary = { currentPrice, change, high, low, open, previousClose };
    }

    return price;
  }

  async getNews(symbol: string, context: MarketRequestContext = {}): Promise<NewsItem[]> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const profile = await this.getProfile(symbol, resolvedContext).catch(() => undefined);
    const { newsService } = await import('../news/news.service');
    return newsService.getStockNews(symbol, resolvedContext, profile);
  }

  async getRecommendation(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<AnalystRecommendation> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    return this.tryProvidersInFallback('recommendation', resolvedContext.market, (provider) =>
      provider.getRecommendation(symbol, resolvedContext)
    );
  }

  async getFundamentals(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<FundamentalsOverview> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const provider = marketDataProviderResolver.resolveOptional(
      resolvedContext.market,
      'fundamentals'
    );
    if (!provider?.getFundamentals) {
      const availability = {
        status: 'not-supported' as const,
        message: 'Fundamentals are not available for this market.'
      };
      return {
        company: {
          identity: { symbol, displaySymbol: symbol, name: '', market: resolvedContext.market },
          availability
        },
        valuation: {},
        profitability: {},
        perShare: {},
        valuationAvailability: availability,
        profitabilityAvailability: availability,
        perShareAvailability: availability,
        availability
      };
    }
    return provider.getFundamentals(symbol, resolvedContext);
  }

  async getFinancialStatements(
    symbol: string,
    options: FinancialStatementOptions,
    context: MarketRequestContext = {}
  ): Promise<FinancialStatementsResearch> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const provider = marketDataProviderResolver.resolveOptional(
      resolvedContext.market,
      'financialStatements'
    );
    if (!provider?.getFinancialStatements) {
      return {
        incomeStatement: this.unsupportedStatement('income', options),
        balanceSheet: this.unsupportedStatement('balance-sheet', {
          ...options,
          reportingPeriod: 'yearly'
        }),
        cashFlow: this.unsupportedStatement('cash-flow', {
          ...options,
          reportingPeriod: 'yearly'
        })
      };
    }
    return provider.getFinancialStatements(symbol, resolvedContext, options);
  }

  async getShareholding(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<ShareholdingResearch> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const provider = marketDataProviderResolver.resolveOptional(
      resolvedContext.market,
      'shareholding'
    );
    if (!provider?.getShareholding) {
      return {
        categories: [],
        availability: {
          status: 'not-supported',
          message: 'Shareholding data is not available for this market.'
        }
      };
    }
    return provider.getShareholding(symbol, resolvedContext);
  }

  async getCorporateActions(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<CorporateActionsResearch> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const provider = marketDataProviderResolver.resolveOptional(
      resolvedContext.market,
      'corporateActions'
    );
    if (!provider?.getCorporateActions) {
      return {
        actions: [],
        availability: {
          status: 'not-supported',
          message: 'Corporate actions are not available for this market.'
        }
      };
    }
    return provider.getCorporateActions(symbol, resolvedContext);
  }

  async getCompetitors(
    symbol: string,
    context: MarketRequestContext = {}
  ): Promise<CompetitorsResearch> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const provider = marketDataProviderResolver.resolveOptional(
      resolvedContext.market,
      'competitors'
    );
    if (!provider?.getCompetitors) {
      return {
        competitors: [],
        availability: {
          status: 'not-supported',
          message: 'Competitor data is not available for this market.'
        }
      };
    }
    return provider.getCompetitors(symbol, resolvedContext);
  }

  async getStock(symbol: string, context: MarketRequestContext = {}): Promise<NormalizedStockData> {
    const resolvedContext = this.contextForSymbol(symbol, context);
    const [profileResult, priceResult, newsResult, recommendationResult] = await Promise.allSettled([
      this.getProfile(symbol, resolvedContext),
      this.getQuote(symbol, resolvedContext),
      this.getNews(symbol, resolvedContext),
      this.getRecommendation(symbol, resolvedContext)
    ]);

    if (profileResult.status === 'rejected' && priceResult.status === 'rejected') {
      const reason = profileResult.reason;
      if (reason instanceof MarketDataError) throw reason;
      throw new MarketDataError('INSTRUMENT_NOT_FOUND', `Instrument ${symbol} could not be loaded.`);
    }

    const profile = profileResult.status === 'fulfilled' ? profileResult.value : undefined;
    const price = priceResult.status === 'fulfilled' ? priceResult.value : undefined;
    return {
      identity: {
        symbol,
        displaySymbol: profile?.ticker || symbol,
        name: profile?.name ?? '',
        market: resolvedContext.market,
        exchange: profile?.exchange,
        isin: profile?.isin,
        instrumentKey: profile?.instrumentKey,
        countryCode: resolvedContext.market
          ? MARKET_CONFIG[resolvedContext.market].countryCode
          : undefined,
        currency: isCurrencyCode(profile?.currency) ? profile.currency : price?.sourceCurrency,
        provider:
          resolvedContext.market === 'IN' ? 'upstox' : 'finnhub'
      },
      profile,
      price,
      news: newsResult.status === 'fulfilled' ? newsResult.value : undefined,
      recommendation:
        recommendationResult.status === 'fulfilled' ? recommendationResult.value : undefined
    };
  }

  private unsupportedStatement(
    kind: StatementKind,
    options: FinancialStatementOptions
  ): FinancialStatementData {
    return {
      kind,
      statementType: options.statementType,
      reportingPeriod: options.reportingPeriod,
      sourceUnit: 'crore',
      summary: [],
      details: [],
      availability: {
        status: 'not-supported',
        message: 'Financial statements are not available for this market.'
      }
    };
  }

  private contextForSymbol(symbol: string, context: MarketRequestContext): MarketRequestContext {
    const normalized = symbol.trim().toUpperCase();
    if (normalized.endsWith('.NS') || normalized.endsWith('.BO')) {
      return { ...context, market: 'IN' };
    }
    return context;
  }

  private loadProviderProfile(
    provider: ReturnType<typeof marketDataProviderResolver.resolve>,
    symbol: string,
    context: MarketRequestContext
  ): Promise<CompanyProfile> {
    const key = `${provider.name}:${symbol.toUpperCase()}:${context.displayCurrency ?? ''}`;
    const cached = this.profileCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.profile);

    const pending = this.pendingProfiles.get(key);
    if (pending) return pending;

    const request = provider.getProfile(symbol, context)
      .then((profile) => {
        this.profileCache.set(key, { profile, expiresAt: Date.now() + 60 * 60 * 1000 });
        return profile;
      })
      .finally(() => this.pendingProfiles.delete(key));
    this.pendingProfiles.set(key, request);
    return request;
  }
}

export const marketDataService = new MarketDataService();
