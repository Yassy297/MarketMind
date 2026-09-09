import type { Request, Response } from 'express';
import { WatchlistError, watchlistService } from '../services/watchlist.service';
import {
  addWatchlistItemSchema,
  createWatchlistSchema,
  updateWatchlistItemSchema,
  updateWatchlistSchema,
  watchlistMembershipQuerySchema
} from '../validators/watchlist.validators';

const routeId = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

const requireUser = (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Authentication required.' });
    return null;
  }
  return req.user.id;
};

const sendWatchlistError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof WatchlistError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error('Watchlist request failed:', error instanceof Error ? error.message : error);
  res.status(500).json({ message: fallback });
};

const sendValidationError = (res: Response, result: { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } }) => {
  res.status(422).json({
    message: result.error.issues[0]?.message ?? 'Invalid watchlist request.',
    errors: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
  });
};

export const listWatchlists = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    res.json(await watchlistService.listWatchlists(userId));
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to load watchlists.');
  }
};

export const createWatchlist = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = createWatchlistSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed);
    return;
  }
  try {
    res.status(201).json(await watchlistService.createWatchlist(userId, parsed.data));
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to create watchlist.');
  }
};

export const updateWatchlist = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = updateWatchlistSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed);
    return;
  }
  try {
    res.json(await watchlistService.updateWatchlist(userId, routeId(req.params.watchlistId), parsed.data));
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to update watchlist.');
  }
};

export const deleteWatchlist = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await watchlistService.deleteWatchlist(userId, routeId(req.params.watchlistId));
    res.status(204).send();
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to delete watchlist.');
  }
};

export const listWatchlistMemberships = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = watchlistMembershipQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    sendValidationError(res, parsed);
    return;
  }
  try {
    res.json(await watchlistService.findMemberships(userId, parsed.data));
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to load watchlist membership.');
  }
};

export const listWatchlistItems = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    res.json(await watchlistService.listItems(userId, routeId(req.params.watchlistId)));
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to load watchlist items.');
  }
};

export const addWatchlistItem = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = addWatchlistItemSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed);
    return;
  }
  try {
    res.status(201).json(await watchlistService.addItem(userId, routeId(req.params.watchlistId), parsed.data));
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to add instrument to watchlist.');
  }
};

export const removeWatchlistItem = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await watchlistService.removeItem(
      userId,
      routeId(req.params.watchlistId),
      routeId(req.params.itemId)
    );
    res.status(204).send();
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to remove instrument from watchlist.');
  }
};

export const updateWatchlistItem = async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const parsed = updateWatchlistItemSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed);
    return;
  }
  try {
    res.json(
      await watchlistService.updateItem(
        userId,
        routeId(req.params.watchlistId),
        routeId(req.params.itemId),
        parsed.data
      )
    );
  } catch (error) {
    sendWatchlistError(res, error, 'Unable to reorder watchlist item.');
  }
};