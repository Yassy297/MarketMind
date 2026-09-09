import { Router } from 'express';
import {
  addWatchlistItem,
  createWatchlist,
  deleteWatchlist,
  listWatchlistItems,
  listWatchlistMemberships,
  listWatchlists,
  removeWatchlistItem,
  updateWatchlist,
  updateWatchlistItem
} from '../controllers/watchlist.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', listWatchlists);
router.post('/', createWatchlist);
router.get('/membership', listWatchlistMemberships);
router.patch('/:watchlistId', updateWatchlist);
router.delete('/:watchlistId', deleteWatchlist);
router.get('/:watchlistId/items', listWatchlistItems);
router.post('/:watchlistId/items', addWatchlistItem);
router.patch('/:watchlistId/items/:itemId', updateWatchlistItem);
router.delete('/:watchlistId/items/:itemId', removeWatchlistItem);

export default router;