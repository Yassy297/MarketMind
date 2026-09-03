import type { JournalDirection, JournalStatus } from '../../types/journal';

export type JournalFinancialInput = {
  direction: JournalDirection;
  status: JournalStatus;
  entryPrice: number;
  exitPrice?: number | null;
  quantity: number;
  fees?: number | null;
  stopLoss?: number | null;
  target?: number | null;
};

export type JournalFinancials = {
  investedAmount: number | null;
  exitValue: number | null;
  grossPnl: number | null;
  netPnl: number | null;
  returnPercent: number | null;
  riskAmount: number | null;
  rewardAmount: number | null;
  riskRewardRatio: number | null;
};

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const calculateJournalFinancials = (input: JournalFinancialInput): JournalFinancials => {
  const fees = finite(input.fees) ? input.fees : 0;
  const investedAmount = finite(input.entryPrice) && finite(input.quantity)
    ? roundMoney(input.entryPrice * input.quantity)
    : null;

  const exitPrice = input.exitPrice;
  const hasExit =
    input.status === 'CLOSED' && finite(exitPrice) && finite(input.quantity);
  const exitValue = hasExit && finite(exitPrice) ? roundMoney(exitPrice * input.quantity) : null;

  let grossPnl: number | null = null;
  if (hasExit && finite(input.entryPrice) && finite(exitPrice)) {
    const delta =
      input.direction === 'LONG'
        ? exitPrice - input.entryPrice
        : input.entryPrice - exitPrice;
    grossPnl = roundMoney(delta * input.quantity);
  }

  const netPnl = grossPnl === null ? null : roundMoney(grossPnl - fees);
  const returnPercent =
    netPnl === null || investedAmount === null || investedAmount === 0
      ? null
      : roundMoney((netPnl / investedAmount) * 100);

  const riskAmount =
    finite(input.stopLoss) && finite(input.entryPrice) && finite(input.quantity)
      ? roundMoney(Math.abs(input.entryPrice - input.stopLoss) * input.quantity)
      : null;
  const rewardAmount =
    finite(input.target) && finite(input.entryPrice) && finite(input.quantity)
      ? roundMoney(Math.abs(input.target - input.entryPrice) * input.quantity)
      : null;
  const riskRewardRatio =
    riskAmount && riskAmount > 0 && rewardAmount !== null
      ? roundMoney(rewardAmount / riskAmount)
      : null;

  return {
    investedAmount,
    exitValue,
    grossPnl,
    netPnl,
    returnPercent,
    riskAmount,
    rewardAmount,
    riskRewardRatio
  };
};
