import type { Request, Response } from 'express';
import { stockService } from '../services/stock.service';

const normalizeSymbol = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized?.trim().toUpperCase() ?? '';
};

export const searchStocks = async (req: Request, res: Response) => {
  try {
    const rawQuery = req.query.q;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    if (!query) {
      res.json([]);
      return;
    }

    const results = await stockService.searchStocks(query);
    res.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to search stocks.';
    res.status(500).json({ message });
  }
};

export const getStockProfile = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const profile = await stockService.getStockProfile(normalizedSymbol);

    if (req.user?.id && normalizedSymbol) {
      await stockService.recordRecentlyViewed(req.user.id, normalizedSymbol, profile.name || normalizedSymbol);
    }

    res.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load stock profile.';
    res.status(500).json({ message });
  }
};

export const getStockQuote = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const quote = await stockService.getStockQuote(normalizedSymbol);
    res.json(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load stock quote.';
    res.status(500).json({ message });
  }
};

export const getStockNews = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const news = await stockService.getStockNews(normalizedSymbol);
    res.json(news);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load stock news.';
    res.status(500).json({ message });
  }
};

export const getRecommendation = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = normalizeSymbol(symbol);
    const recommendation = await stockService.getRecommendation(normalizedSymbol);
    res.json(recommendation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load recommendation.';
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
