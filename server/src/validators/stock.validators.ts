import { z } from 'zod';
import { isCurrencyCode } from '../config/currencies';
import { isMarketCode } from '../config/markets';
import type { CurrencyCode, MarketCode } from '../types/market';

const market = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .refine((value) => !value || isMarketCode(value), 'Unsupported market.')
  .transform((value): MarketCode | undefined => (value && isMarketCode(value) ? value : undefined));

const currency = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .refine((value) => !value || isCurrencyCode(value), 'Unsupported currency.')
  .transform((value): CurrencyCode | undefined => (value && isCurrencyCode(value) ? value : undefined));

export const stockSnapshotsSchema = z.object({
  instruments: z
    .array(
      z.object({
        symbol: z.string().trim().min(1, 'Instrument symbol is required.').max(80).transform((value) => value.toUpperCase()),
        market
      })
    )
    .min(1, 'At least one instrument is required.')
    .max(40, 'A snapshot request can include at most 40 instruments.'),
  currency
});

export type StockSnapshotsInput = z.infer<typeof stockSnapshotsSchema>;
