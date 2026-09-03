import { z } from 'zod';
import { isCurrencyCode } from '../config/currencies';
import { isMarketCode } from '../config/markets';
import {
  JOURNAL_ASSET_CLASSES,
  JOURNAL_DIRECTIONS,
  JOURNAL_STATUSES
} from '../types/journal';
import type { CurrencyCode, MarketCode } from '../types/market';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined));

const optionalNumber = z
  .number()
  .finite()
  .nonnegative()
  .nullable()
  .optional();

const timeString = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM time.')
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

const tagList = z
  .array(z.string().trim().min(1).max(40))
  .max(20)
  .optional()
  .transform((value) => value?.filter(Boolean));

const assetDetailsSchema = z
  .object({
    exchange: optionalText(40),
    pair: optionalText(40),
    fundName: optionalText(160),
    units: optionalNumber,
    underlying: optionalText(80),
    optionType: z.enum(['call', 'put']).optional(),
    strike: optionalNumber,
    expiry: optionalText(20),
    premium: optionalNumber,
    lots: optionalNumber,
    lotSize: optionalNumber,
    contract: optionalText(80),
    contractSize: optionalNumber,
    commodity: optionalText(80),
    currencyPair: optionalText(20),
    issuer: optionalText(160),
    faceValue: optionalNumber,
    coupon: optionalNumber,
    customName: optionalText(160)
  })
  .optional();

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(160),
  url: optionalText(500),
  mimeType: optionalText(80),
  size: z.number().finite().nonnegative().optional()
});

const closedTradeRefinement = (
  value: {
    status: 'OPEN' | 'CLOSED';
    exitPrice?: number | null;
    exitDate?: string | null;
    entryDate: string;
  },
  ctx: z.RefinementCtx
) => {
  if (value.status === 'CLOSED') {
    if (value.exitPrice === null || value.exitPrice === undefined) {
      ctx.addIssue({ code: 'custom', path: ['exitPrice'], message: 'Exit price is required for closed trades.' });
    }
    if (!value.exitDate) {
      ctx.addIssue({ code: 'custom', path: ['exitDate'], message: 'Exit date is required for closed trades.' });
    }
  }
  if (value.exitDate && value.entryDate && new Date(value.exitDate) < new Date(value.entryDate)) {
    ctx.addIssue({ code: 'custom', path: ['exitDate'], message: 'Exit date cannot precede entry date.' });
  }
};

const tradeFields = {
  instrumentId: optionalText(80),
  symbol: z.string().trim().min(1, 'Instrument symbol is required.').max(40),
  displaySymbol: z.string().trim().min(1, 'Display symbol is required.').max(40),
  instrumentName: z.string().trim().min(1, 'Instrument name is required.').max(160),
  assetClass: z.enum(JOURNAL_ASSET_CLASSES),
  market: z
    .string()
    .optional()
    .refine((value) => !value || isMarketCode(value), 'Unsupported market.')
    .transform((value): MarketCode | undefined => (value && isMarketCode(value) ? value : undefined)),
  exchange: optionalText(40),
  currency: z
    .string()
    .refine(isCurrencyCode, 'Unsupported currency.')
    .transform((value): CurrencyCode => value as CurrencyCode),
  direction: z.enum(JOURNAL_DIRECTIONS),
  status: z.enum(JOURNAL_STATUSES),
  entryPrice: z.number().finite().nonnegative('Entry price cannot be negative.'),
  exitPrice: optionalNumber,
  quantity: z.number().finite().positive('Quantity must be positive.'),
  entryDate: z.string().trim().min(1, 'Entry date is required.'),
  entryTime: timeString,
  exitDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
  exitTime: timeString,
  fees: z.number().finite().nonnegative().optional(),
  stopLoss: optionalNumber,
  target: optionalNumber,
  thesis: optionalText(4000),
  entryReason: optionalText(2000),
  exitReason: optionalText(2000),
  strategy: optionalText(80),
  setup: optionalText(80),
  marketCondition: optionalText(80),
  tradeQuality: z.number().int().min(1).max(5).nullable().optional(),
  executionNotes: optionalText(2000),
  confidence: z.number().int().min(1).max(10).nullable().optional(),
  emotionBefore: optionalText(40),
  emotionAfter: optionalText(40),
  followedPlan: z.boolean().nullable().optional(),
  mistakeTags: tagList,
  lessonLearned: optionalText(2000),
  whatWentRight: optionalText(2000),
  whatWentWrong: optionalText(2000),
  whatWouldDoDifferently: optionalText(2000),
  notes: optionalText(4000),
  tags: tagList,
  attachments: z.array(attachmentSchema).max(10).optional(),
  assetDetails: assetDetailsSchema
};

export const createJournalTradeSchema = z.object(tradeFields).superRefine(closedTradeRefinement);

export const updateJournalTradeSchema = z.object(tradeFields).partial();

export const journalListQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  assetClass: z.enum(JOURNAL_ASSET_CLASSES).optional(),
  market: z
    .string()
    .optional()
    .refine((value) => !value || isMarketCode(value), 'Unsupported market.')
    .transform((value): MarketCode | undefined => (value && isMarketCode(value) ? value : undefined)),
  direction: z.enum(JOURNAL_DIRECTIONS).optional(),
  status: z.enum(JOURNAL_STATUSES).optional(),
  strategy: z.string().trim().max(80).optional(),
  setup: z.string().trim().max(80).optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : (Array.isArray(value) ? value : value.split(',')).map((tag) => tag.trim()).filter(Boolean)
    ),
  from: z.string().optional(),
  to: z.string().optional(),
  outcome: z.enum(['profitable', 'losing']).optional(),
  sort: z.enum(['entryDate', 'exitDate', 'netPnl', 'createdAt', 'symbol']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional()
});

const analyticsFilters = {
  from: z.string().optional(),
  to: z.string().optional(),
  assetClass: z.enum(JOURNAL_ASSET_CLASSES).optional(),
  market: z
    .string()
    .optional()
    .refine((value) => !value || isMarketCode(value), 'Unsupported market.')
    .transform((value): MarketCode | undefined => (value && isMarketCode(value) ? value : undefined)),
  direction: z.enum(JOURNAL_DIRECTIONS).optional(),
  strategy: z.string().trim().max(80).optional(),
  setup: z.string().trim().max(80).optional()
};

export const journalCalendarQuerySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100),
  month: z.coerce.number().int().min(1).max(12)
});

export const journalCalendarDayQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a YYYY-MM-DD date.')
});

export const journalAnalyticsQuerySchema = z.object({
  report: z.enum(['performance', 'strategy', 'setup', 'assetClass', 'psychology', 'time', 'risk']),
  ...analyticsFilters
});

export const journalOverviewQuerySchema = z.object(analyticsFilters);

export type CreateJournalTradeInput = z.infer<typeof createJournalTradeSchema>;
export type UpdateJournalTradeInput = z.infer<typeof updateJournalTradeSchema>;
