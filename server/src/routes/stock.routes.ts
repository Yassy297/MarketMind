import { Router } from 'express';
import {
  getRecentlyViewed,
  getRecommendation,
  getStockNews,
  getStockProfile,
  getStockQuote,
  searchStocks
} from '../controllers/stock.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/search', requireAuth, searchStocks);
router.get('/recently-viewed', requireAuth, getRecentlyViewed);
router.get('/:symbol/profile', requireAuth, getStockProfile);
router.get('/:symbol/quote', requireAuth, getStockQuote);
router.get('/:symbol/news', requireAuth, getStockNews);
router.get('/:symbol/recommendation', requireAuth, getRecommendation);

export default router;
