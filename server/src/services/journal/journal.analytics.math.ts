export type AnalyticsTrade = {
  id: string;
  entryDate: string;
  entryTime?: string;
  exitDate?: string | null;
  netPnl: number | null;
  returnPercent: number | null;
  status: 'OPEN' | 'CLOSED';
  strategy?: string;
  setup?: string;
  assetClass: string;
  direction: string;
  emotionBefore?: string;
  followedPlan?: boolean | null;
  mistakeTags?: string[];
  confidence?: number | null;
  stopLoss?: number | null;
  target?: number | null;
  riskRewardRatio?: number | null;
  holdingDurationMs?: number | null;
};

export const isClosedWithPnl = (trade: AnalyticsTrade) =>
  trade.status === 'CLOSED' && typeof trade.netPnl === 'number' && Number.isFinite(trade.netPnl);

export const isWin = (trade: AnalyticsTrade) => isClosedWithPnl(trade) && (trade.netPnl as number) > 0;
export const isLoss = (trade: AnalyticsTrade) => isClosedWithPnl(trade) && (trade.netPnl as number) < 0;
export const isBreakeven = (trade: AnalyticsTrade) => isClosedWithPnl(trade) && trade.netPnl === 0;

const round = (value: number) => Math.round(value * 100) / 100;

export const summarizeClosedTrades = (trades: AnalyticsTrade[]) => {
  const closed = trades.filter(isClosedWithPnl);
  const wins = closed.filter(isWin);
  const losses = closed.filter(isLoss);
  const breakeven = closed.filter(isBreakeven);
  const decided = wins.length + losses.length;
  const netPnl = closed.reduce((sum, trade) => sum + (trade.netPnl as number), 0);
  const winPnl = wins.reduce((sum, trade) => sum + (trade.netPnl as number), 0);
  const lossPnl = losses.reduce((sum, trade) => sum + (trade.netPnl as number), 0);
  const returns = closed
    .map((trade) => trade.returnPercent)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const best = closed.reduce<number | null>(
    (current, trade) => (current === null || (trade.netPnl as number) > current ? (trade.netPnl as number) : current),
    null
  );
  const worst = closed.reduce<number | null>(
    (current, trade) => (current === null || (trade.netPnl as number) < current ? (trade.netPnl as number) : current),
    null
  );

  return {
    closedCount: closed.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    netPnl: closed.length ? round(netPnl) : null,
    averageTrade: closed.length ? round(netPnl / closed.length) : null,
    averageWin: wins.length ? round(winPnl / wins.length) : null,
    averageLoss: losses.length ? round(lossPnl / losses.length) : null,
    winRate: decided ? round((wins.length / decided) * 100) : null,
    profitFactor: losses.length && lossPnl !== 0 ? round(winPnl / Math.abs(lossPnl)) : null,
    expectancy: decided
      ? round((wins.length / decided) * (wins.length ? winPnl / wins.length : 0) + (losses.length / decided) * (losses.length ? lossPnl / losses.length : 0))
      : null,
    averageReturn: returns.length ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length) : null,
    bestTrade: best,
    worstTrade: worst
  };
};

export const computeStreaks = (trades: AnalyticsTrade[]) => {
  const closed = trades
    .filter(isClosedWithPnl)
    .slice()
    .sort((left, right) => left.entryDate.localeCompare(right.entryDate) || left.id.localeCompare(right.id));

  let currentWin = 0;
  let currentLoss = 0;
  let longestWin = 0;
  let longestLoss = 0;

  for (const trade of closed) {
    if (isWin(trade)) {
      currentWin += 1;
      currentLoss = 0;
      longestWin = Math.max(longestWin, currentWin);
    } else if (isLoss(trade)) {
      currentLoss += 1;
      currentWin = 0;
      longestLoss = Math.max(longestLoss, currentLoss);
    } else {
      currentWin = 0;
      currentLoss = 0;
    }
  }

  return {
    currentWinStreak: currentWin,
    currentLossStreak: currentLoss,
    longestWinStreak: longestWin,
    longestLossStreak: longestLoss
  };
};

export const groupByKey = (trades: AnalyticsTrade[], keyFn: (trade: AnalyticsTrade) => string) => {
  const groups = new Map<string, AnalyticsTrade[]>();
  for (const trade of trades) {
    const key = keyFn(trade);
    const list = groups.get(key) ?? [];
    list.push(trade);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([key, items]) => {
    const summary = summarizeClosedTrades(items);
    return {
      key,
      trades: items.length,
      closedTrades: summary.closedCount,
      wins: summary.wins,
      losses: summary.losses,
      winRate: summary.winRate,
      netPnl: summary.netPnl,
      averagePnl: summary.averageTrade,
      bestTrade: summary.bestTrade,
      worstTrade: summary.worstTrade
    };
  });
};

export const pnlSeries = (trades: AnalyticsTrade[]) => {
  const closed = trades
    .filter(isClosedWithPnl)
    .slice()
    .sort((left, right) => left.entryDate.localeCompare(right.entryDate));
  const byDay = new Map<string, number>();
  for (const trade of closed) {
    byDay.set(trade.entryDate, (byDay.get(trade.entryDate) ?? 0) + (trade.netPnl as number));
  }
  let cumulative = 0;
  return [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, pnl]) => {
      cumulative += pnl;
      return { date, pnl: round(pnl), cumulative: round(cumulative) };
    });
};

export const monthlySeries = (trades: AnalyticsTrade[]) => {
  const groups = new Map<string, AnalyticsTrade[]>();
  for (const trade of trades) {
    const month = trade.entryDate.slice(0, 7);
    const list = groups.get(month) ?? [];
    list.push(trade);
    groups.set(month, list);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, items]) => {
      const summary = summarizeClosedTrades(items);
      return {
        month,
        trades: items.length,
        wins: summary.wins,
        losses: summary.losses,
        netPnl: summary.netPnl
      };
    });
};

export const weekdayLabel = (isoDate: string) =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date(`${isoDate}T00:00:00Z`).getUTCDay()
  ];

export const holdingBucket = (ms?: number | null) => {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return null;
  if (ms < 60 * 60 * 1000) return 'Under 1 hour';
  if (ms < 24 * 60 * 60 * 1000) return '1 hour – 1 day';
  if (ms < 7 * 24 * 60 * 60 * 1000) return '1 – 7 days';
  return 'Over 7 days';
};

export const confidenceBucket = (value?: number | null) => {
  if (value === null || value === undefined) return 'Unspecified';
  if (value <= 3) return '1–3';
  if (value <= 7) return '4–7';
  return '8–10';
};

export const unspecified = (value?: string | null) => (value?.trim() ? value.trim() : 'Unspecified');
