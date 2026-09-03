import { Router } from 'express';
import {
  createJournalTrade,
  deleteJournalTrade,
  duplicateJournalTrade,
  getJournalAnalytics,
  getJournalCalendar,
  getJournalCalendarDay,
  getJournalOverview,
  getJournalStats,
  getJournalTrade,
  listJournalTrades,
  updateJournalTrade
} from '../controllers/journal.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/overview', getJournalOverview);
router.get('/analytics', getJournalAnalytics);
router.get('/calendar', getJournalCalendar);
router.get('/calendar/day', getJournalCalendarDay);
router.get('/stats', getJournalStats);
router.get('/trades', listJournalTrades);
router.post('/trades', createJournalTrade);
router.get('/trades/:id', getJournalTrade);
router.patch('/trades/:id', updateJournalTrade);
router.delete('/trades/:id', deleteJournalTrade);
router.post('/trades/:id/duplicate', duplicateJournalTrade);

export default router;
