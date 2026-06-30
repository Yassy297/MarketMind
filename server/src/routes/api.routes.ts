import { Router } from 'express';
import { getStocks, getDocuments, getChat, getWatchlist } from '@/controllers/api.controller';

const router = Router();

router.get('/stocks', getStocks);
router.get('/documents', getDocuments);
router.get('/chat', getChat);
router.get('/watchlist', getWatchlist);

export default router;
