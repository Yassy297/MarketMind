import { Router } from 'express';
import {
  getMarketContext,
  updateMarketContext
} from '../controllers/market-context.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getMarketContext);
router.patch('/', requireAuth, updateMarketContext);

export default router;
