import type { Request, Response } from 'express';
import { isCountryCode, isCurrencyCode, isMarketCode } from '../config/markets';
import {
  marketContextService,
  type MarketPreferenceUpdate
} from '../services/market-context.service';

const parseUpdate = (body: unknown): MarketPreferenceUpdate => {
  if (!body || typeof body !== 'object') throw new Error('A preference update is required.');

  const input = body as Record<string, unknown>;
  const update: MarketPreferenceUpdate = {};

  if ('country' in input) {
    if (input.country !== null && !isCountryCode(input.country)) {
      throw new Error('Unsupported country.');
    }
    update.country = input.country;
  }

  if ('market' in input) {
    if (input.market !== null && !isMarketCode(input.market)) {
      throw new Error('Unsupported market.');
    }
    update.market = input.market;
  }

  if ('currency' in input) {
    if (input.currency !== null && !isCurrencyCode(input.currency)) {
      throw new Error('Unsupported currency.');
    }
    update.currency = input.currency;
  }

  return update;
};

export const getMarketContext = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }
    res.json(await marketContextService.getForUser(req.user.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load market preferences.';
    res.status(500).json({ message });
  }
};

export const updateMarketContext = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }
    const update = parseUpdate(req.body);
    res.json(await marketContextService.updateForUser(req.user.id, update));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update market preferences.';
    const status = message === 'User not found.' ? 404 : 400;
    res.status(status).json({ message });
  }
};
