import { z } from 'zod';
import { isCurrencyCode } from '../config/currencies';
import { isMarketCode } from '../config/markets';
import type { CountryCode, CurrencyCode, MarketCode } from '../types/market';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined));

const market = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .refine((value) => !value || isMarketCode(value), 'Unsupported market.')
  .transform((value): MarketCode | undefined => (value && isMarketCode(value) ? value : undefined));

const countryCode = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .refine((value) => !value || isMarketCode(value), 'Unsupported country.')
  .transform((value): CountryCode | undefined => (value && isMarketCode(value) ? value : undefined));

const currency = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .refine((value) => !value || isCurrencyCode(value), 'Unsupported currency.')
  .transform((value): CurrencyCode | undefined => (value && isCurrencyCode(value) ? value : undefined));

const sortOrder = z.number().finite().int().min(0, 'Sort order cannot be negative.').optional();

export const createWatchlistSchema = z.object({
  name: z.string().trim().min(1, 'Watchlist name is required.').max(80, 'Watchlist name is too long.'),
  description: optionalText(500),
  sortOrder
});

export const updateWatchlistSchema = z
  .object({
    name: z.string().trim().min(1, 'Watchlist name cannot be empty.').max(80, 'Watchlist name is too long.').optional(),
    description: z.string().trim().max(500, 'Watchlist description is too long.').optional(),
    sortOrder
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one watchlist field is required.');

export const addWatchlistItemSchema = z.object({
  instrumentId: optionalText(120),
  instrumentKey: optionalText(160),
  provider: z.enum(['finnhub', 'upstox', 'twelveData']).optional(),
  symbol: z.string().trim().min(1, 'Instrument symbol is required.').max(80).transform((value) => value.toUpperCase()),
  displaySymbol: z.string().trim().min(1, 'Display symbol is required.').max(80),
  companyName: z.string().trim().min(1, 'Company name is required.').max(160),
  market,
  exchange: optionalText(80),
  countryCode,
  currency,
  isin: optionalText(40).transform((value) => value?.toUpperCase())
});

export const updateWatchlistItemSchema = z.object({
  sortOrder: z.number().finite().int().min(0, 'Sort order cannot be negative.')
});

export type CreateWatchlistInput = z.infer<typeof createWatchlistSchema>;
export type UpdateWatchlistInput = z.infer<typeof updateWatchlistSchema>;
export type AddWatchlistItemInput = z.infer<typeof addWatchlistItemSchema>;
export type UpdateWatchlistItemInput = z.infer<typeof updateWatchlistItemSchema>;