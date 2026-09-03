import type { Request, Response } from 'express';
import { journalService, JournalError } from '../services/journal/journal.service';
import { journalAnalyticsService } from '../services/journal/journal.analytics.service';
import { journalCalendarService } from '../services/journal/journal.calendar.service';
import {
  createJournalTradeSchema,
  journalAnalyticsQuerySchema,
  journalCalendarDayQuerySchema,
  journalCalendarQuerySchema,
  journalListQuerySchema,
  journalOverviewQuerySchema,
  updateJournalTradeSchema
} from '../validators/journal.validators';

const routeId = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

const requireUser = (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Authentication required.' });
    return null;
  }
  return req.user.id;
};

const sendJournalError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof JournalError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error('Journal request failed:', error instanceof Error ? error.message : error);
  res.status(500).json({ message: fallback });
};

export const createJournalTrade = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = createJournalTradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      message: parsed.error.issues[0]?.message ?? 'Invalid trade.',
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }
  try {
    const trade = await journalService.create(userId, parsed.data);
    res.status(201).json(trade);
  } catch (error) {
    sendJournalError(res, error, 'Unable to save the trade.');
  }
};

export const listJournalTrades = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = journalListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid filters.' });
    return;
  }
  try {
    res.json(await journalService.list(userId, parsed.data));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load trades.');
  }
};

export const getJournalOverview = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = journalOverviewQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid filters.' });
    return;
  }
  try {
    res.json(await journalAnalyticsService.overview(userId, parsed.data));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load journal overview.');
  }
};

export const getJournalAnalytics = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = journalAnalyticsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid analytics request.' });
    return;
  }
  const { report, ...filters } = parsed.data;
  try {
    res.json(await journalAnalyticsService.report(userId, report, filters));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load journal analytics.');
  }
};

export const getJournalCalendar = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = journalCalendarQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid calendar request.' });
    return;
  }
  try {
    res.json(await journalCalendarService.month(userId, parsed.data.year, parsed.data.month));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load the journal calendar.');
  }
};

export const getJournalCalendarDay = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = journalCalendarDayQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid day request.' });
    return;
  }
  try {
    res.json(await journalCalendarService.day(userId, parsed.data.date));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load that day.');
  }
};

export const getJournalStats = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    res.json(await journalService.stats(userId));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load journal overview.');
  }
};

export const getJournalTrade = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    res.json(await journalService.getById(userId, routeId(req.params.id)));
  } catch (error) {
    sendJournalError(res, error, 'Unable to load the trade.');
  }
};

export const updateJournalTrade = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = updateJournalTradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      message: parsed.error.issues[0]?.message ?? 'Invalid trade update.',
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }
  try {
    res.json(await journalService.update(userId, routeId(req.params.id), parsed.data));
  } catch (error) {
    sendJournalError(res, error, 'Unable to update the trade.');
  }
};

export const deleteJournalTrade = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await journalService.remove(userId, routeId(req.params.id));
    res.status(204).send();
  } catch (error) {
    sendJournalError(res, error, 'Unable to delete the trade.');
  }
};

export const duplicateJournalTrade = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    res.status(201).json(await journalService.duplicate(userId, routeId(req.params.id)));
  } catch (error) {
    sendJournalError(res, error, 'Unable to duplicate the trade.');
  }
};
