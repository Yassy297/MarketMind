import type { JournalAssetClass } from '../types/journal';

export const ASSET_CLASS_OPTIONS: Array<{ value: JournalAssetClass; label: string }> = [
  { value: 'equity', label: 'Equity' },
  { value: 'etf', label: 'ETF' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'option', label: 'Option' },
  { value: 'future', label: 'Future' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'forex', label: 'Forex' },
  { value: 'bond', label: 'Bond' },
  { value: 'reit', label: 'REIT / InvIT' },
  { value: 'other', label: 'Other' }
];

export const MISTAKE_OPTIONS = [
  'FOMO',
  'Revenge Trade',
  'Overtrading',
  'Late Entry',
  'Early Exit',
  'Moved Stop Loss',
  'Ignored Setup',
  'Oversized',
  'No Confirmation',
  'Ignored Risk',
  'Emotional Decision',
  'Other'
];

export const EMOTION_OPTIONS = [
  'Calm',
  'Confident',
  'Excited',
  'Fearful',
  'FOMO',
  'Angry',
  'Revenge',
  'Uncertain',
  'Neutral'
];

export const STRATEGY_OPTIONS = [
  'Trend Following',
  'Momentum',
  'Breakout',
  'Pullback',
  'Mean Reversion',
  'Swing Trading',
  'Position Trading',
  'Value Investing',
  'Growth Investing',
  'Dividend Investing',
  'Intraday',
  'Scalping',
  'News / Event Driven',
  'Earnings',
  'Gap Trading',
  'Support / Resistance',
  'Technical Pattern',
  'Fundamental Analysis',
  'Quantitative / Systematic',
  'Other'
] as const;

export const SETUP_OPTIONS = [
  'Breakout',
  'Breakdown',
  'Pullback to Support',
  'Pullback to Resistance',
  'Support Bounce',
  'Resistance Rejection',
  'Trend Continuation',
  'Trend Reversal',
  'Moving Average Crossover',
  'Moving Average Pullback',
  'RSI Oversold',
  'RSI Overbought',
  'MACD Signal',
  'Volume Breakout',
  'Chart Pattern',
  'Candlestick Pattern',
  'Gap Up',
  'Gap Down',
  'Range Breakout',
  'Range Reversion',
  'Earnings Setup',
  'News Catalyst',
  'Fundamental Mispricing',
  'Other'
] as const;

export const MARKET_CONDITION_OPTIONS = [
  'Strong Uptrend',
  'Weak Uptrend',
  'Strong Downtrend',
  'Weak Downtrend',
  'Sideways / Range',
  'High Volatility',
  'Low Volatility',
  'Bullish Market',
  'Bearish Market',
  'Neutral Market',
  'Event Driven',
  'Earnings Season',
  'News Driven',
  'Uncertain',
  'Other'
] as const;

export const TRADE_QUALITY_OPTIONS = [
  { value: 1, label: '1 — Very poor execution' },
  { value: 2, label: '2 — Poor' },
  { value: 3, label: '3 — Average' },
  { value: 4, label: '4 — Good' },
  { value: 5, label: '5 — Excellent' }
] as const;

export const FIELD_HELP = {
  assetClass: 'Choose the type of instrument this journal entry represents.',
  instrument: 'Select the stock, fund, crypto, contract, currency pair, or other instrument you traded.',
  direction: 'Long means you expected the price to rise. Short means you expected the price to fall.',
  status: 'Open means the trade has not been closed yet. Closed means an exit has been recorded.',
  entryPrice: 'The actual price at which you entered the trade.',
  exitPrice: 'The actual price at which you exited the trade.',
  quantity: 'The number of shares, units, contracts, coins, or other units recorded for this trade.',
  entryDate: 'The date you entered the trade.',
  entryTime: 'The time you entered the trade, if known.',
  exitDate: 'The date you exited the trade.',
  exitTime: 'The time you exited the trade, if known.',
  fees: 'Brokerage, exchange fees, taxes, or other costs associated with this recorded trade.',
  stopLoss: 'The price or level where you planned to exit if the trade moved against you.',
  target: 'The price or level you planned to reach before considering an exit.',
  currency: 'The original currency in which this trade was recorded. Historical values are not changed when your display currency changes.',
  holdingDuration: 'Calculated from the recorded entry and exit timestamps. Open trades show elapsed time only, labeled as currently open.',
  entryReason: 'What specific reason caused you to take this trade?',
  exitReason: 'What caused you to close or plan to close the trade?',
  thesis: 'Your overall reasoning or hypothesis behind the trade.',
  strategy: 'The broader trading approach you used.',
  setup: 'The specific technical, fundamental, or contextual setup that triggered the trade.',
  marketCondition: 'The broader market environment when the trade was taken.',
  executionNotes: 'Record anything about execution that may help later, such as slippage, missed fills, delayed entry, or unusual conditions.',
  confidence: 'How confident were you in your trade plan before entering?',
  tradeQuality: 'This rating reflects the quality of your decision-making and execution, not whether the trade made money.',
  emotionBefore: 'How were you feeling immediately before entering the trade?',
  emotionAfter: 'How did you feel after the trade?',
  followedPlan: 'Whether you followed the plan you intended to follow before entering.',
  mistakes: 'Select any behaviors or mistakes that affected this trade.',
  whatWentRight: 'What aspects of the trade or decision-making worked well?',
  whatWentWrong: 'What could have been executed or decided better?',
  lessonLearned: 'The most useful lesson you want to remember from this trade.',
  whatWouldDoDifferently: 'What would you change if you could take this trade again?',
  notes: 'Any additional context you want to remember later.'
} as const;

export const usesMarketSearch = (assetClass: JournalAssetClass) =>
  assetClass === 'equity' || assetClass === 'etf' || assetClass === 'reit';

export const resolvePresetOrCustom = (
  value: string | undefined,
  options: readonly string[]
): { selected: string; custom: string } => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return { selected: '', custom: '' };
  if (options.includes(trimmed)) return { selected: trimmed, custom: '' };
  return { selected: 'Custom', custom: trimmed };
};

export const persistPresetOrCustom = (selected: string, custom: string): string | undefined => {
  if (selected === 'Custom') {
    const trimmed = custom.trim();
    return trimmed || undefined;
  }
  return selected.trim() || undefined;
};
