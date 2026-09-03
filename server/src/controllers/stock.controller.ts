import type { Request, Response } from 'express';
import { isCurrencyCode, isMarketCode } from '../config/markets';
import { stockService } from '../services/stock.service';
import { normalizeInstrumentSearchQuery } from '../services/market-data/instrumentSearch.query';
import type { MarketRequestContext } from '../types/market';
import { MarketDataError } from '../services/market-data/marketData.errors';
import { NewsError } from '../services/news/news.errors';
import type { FinancialStatementOptions } from '../services/market-data/marketData.types';

const normalizeSymbol = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized?.trim().toUpperCase() ?? '';
};

const getMarketContext = (req: Request, symbol?: string): MarketRequestContext => {
  const market = typeof req.query.market === 'string' ? req.query.market.trim().toUpperCase() : undefined;
  const displayCurrency =
    typeof req.query.currency === 'string' ? req.query.currency.trim().toUpperCase() : undefined;
  let parsedMarket: MarketRequestContext['market'];
  let parsedCurrency: MarketRequestContext['displayCurrency'];

  if (market) {
    if (!isMarketCode(market)) throw new Error(`Unsupported market: ${market}`);
    parsedMarket = market;
  }
  if (displayCurrency) {
    if (!isCurrencyCode(displayCurrency)) {
      throw new Error(`Unsupported display currency: ${displayCurrency}`);
    }
    parsedCurrency = displayCurrency;
  }

  const normalizedSymbol = symbol?.toUpperCase() ?? '';
  const inferredMarket =
    normalizedSymbol.endsWith('.NS') || normalizedSymbol.endsWith('.BO') ? 'IN' : parsedMarket;
  return { market: inferredMarket, displayCurrency: parsedCurrency };
};

const errorStatus = (error: unknown) =>
  error instanceof Error && error.message.startsWith('Unsupported ') ? 400 : 500;

const sendMarketError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof MarketDataError) {
    res.status(error.status).json({ code: error.code, message: error.message });
    return;
  }
  if (error instanceof NewsError) {
    res.status(502).json({ code: error.code, message: fallback });
    return;
  }
  const message = error instanceof Error ? error.message : fallback;
  console.error('Market data request failed:', message);
  res.status(errorStatus(error)).json({ code: 'TEMPORARY_PROVIDER_ERROR', message: fallback });
};

export const searchStocks = async (req: Request, res: Response) => {
  try {
    const rawQuery = req.query.q;
    const query = typeof rawQuery === 'string' ? normalizeInstrumentSearchQuery(rawQuery) : '';
    if (!query) {
      res.json([]);
      return;
    }

    const results = await stockService.searchStocks(query, getMarketContext(req));
    res.json(results);
  } catch (error) {
    sendMarketError(res, error, 'Unable to search stocks.');
  }
};

export const getStockProfile = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const marketContext = getMarketContext(req, normalizedSymbol);
    const profile = await stockService.getStockProfile(normalizedSymbol, marketContext);

    if (req.user?.id && normalizedSymbol) {
      await stockService.recordRecentlyViewed(
        req.user.id,
        normalizedSymbol,
        profile,
        marketContext
      );
    }

    res.json(profile);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load stock profile.');
  }
};

export const getStockQuote = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const quote = await stockService.getStockQuote(normalizedSymbol, getMarketContext(req, normalizedSymbol));
    res.json(quote);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load stock quote.');
  }
};

export const getStockNews = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const news = await stockService.getStockNews(normalizedSymbol, getMarketContext(req, normalizedSymbol));
    res.json(news);
  } catch (error) {
    sendMarketError(res, error, 'News temporarily unavailable.');
  }
};

export const getRecommendation = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const recommendation = await stockService.getRecommendation(normalizedSymbol, getMarketContext(req, normalizedSymbol));
    res.json(recommendation);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load recommendation.');
  }
};

export const getStock = async (req: Request, res: Response) => {
  try {
    const normalizedSymbol = normalizeSymbol(req.params.symbol);
    const marketContext = getMarketContext(req, normalizedSymbol);
    const stock = await stockService.getStock(normalizedSymbol, marketContext);

    if (req.user?.id && normalizedSymbol && stock.profile) {
      await stockService.recordRecentlyViewed(
        req.user.id,
        normalizedSymbol,
        stock.profile,
        marketContext
      );
    }

    res.json(stock);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load stock data.');
  }
};

export const getStockFundamentals = async (req: Request, res: Response) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const data = await stockService.getFundamentals(symbol, getMarketContext(req, symbol));
    res.json(data);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load company fundamentals.');
  }
};

export const getStockStatements = async (req: Request, res: Response) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const rawType = typeof req.query.type === 'string' ? req.query.type : 'consolidated';
    const rawPeriod = typeof req.query.period === 'string' ? req.query.period : 'yearly';
    if (rawType !== 'consolidated' && rawType !== 'standalone') {
      throw new Error(`Unsupported statement type: ${rawType}`);
    }
    if (rawPeriod !== 'yearly' && rawPeriod !== 'quarterly') {
      throw new Error(`Unsupported reporting period: ${rawPeriod}`);
    }
    const options: FinancialStatementOptions = {
      statementType: rawType,
      reportingPeriod: rawPeriod
    };
    const data = await stockService.getFinancialStatements(
      symbol,
      options,
      getMarketContext(req, symbol)
    );
    res.json(data);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load financial statements.');
  }
};

export const getStockShareholding = async (req: Request, res: Response) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const data = await stockService.getShareholding(symbol, getMarketContext(req, symbol));
    res.json(data);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load shareholding data.');
  }
};

export const getStockCorporateActions = async (req: Request, res: Response) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const data = await stockService.getCorporateActions(symbol, getMarketContext(req, symbol));
    res.json(data);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load corporate actions.');
  }
};

export const getStockCompetitors = async (req: Request, res: Response) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const data = await stockService.getCompetitors(symbol, getMarketContext(req, symbol));
    res.json(data);
  } catch (error) {
    sendMarketError(res, error, 'Unable to load competitors.');
  }
};

export const getMarketNews = async (_req: Request, res: Response) => {
  try {
    const news = await stockService.getGeneralMarketNews();
    res.json(news);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load market news.';
    res.status(500).json({ message });
  }
};

export const getRecentlyViewed = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const history = await stockService.getRecentlyViewed(req.user.id);
    res.json(history);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load recently viewed.';
    res.status(500).json({ message });
  }
};
