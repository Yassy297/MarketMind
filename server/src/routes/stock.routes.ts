import { Router } from 'express';
import {
  getRecentlyViewed,
  getRecommendation,
  getStock,
  getStockCompetitors,
  getStockCorporateActions,
  getStockFundamentals,
  getStockNews,
  getStockProfile,
  getStockQuote,
  getStockShareholding,
  getStockSnapshots,
  getStockStatements,
  searchStocks
} from '../controllers/stock.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/search', requireAuth, searchStocks);
router.get('/recently-viewed', requireAuth, getRecentlyViewed);
router.post('/snapshots', requireAuth, getStockSnapshots);
router.get('/:symbol/profile', requireAuth, getStockProfile);
router.get('/:symbol/quote', requireAuth, getStockQuote);
router.get('/:symbol/news', requireAuth, getStockNews);
router.get('/:symbol/recommendation', requireAuth, getRecommendation);
router.get('/:symbol/fundamentals', requireAuth, getStockFundamentals);
router.get('/:symbol/statements', requireAuth, getStockStatements);
router.get('/:symbol/shareholding', requireAuth, getStockShareholding);
router.get('/:symbol/corporate-actions', requireAuth, getStockCorporateActions);
router.get('/:symbol/competitors', requireAuth, getStockCompetitors);
router.get('/:symbol', requireAuth, getStock);

export default router;
