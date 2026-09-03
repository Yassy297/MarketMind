import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateJournalFinancials } from './journal.pnl';

describe('calculateJournalFinancials', () => {
  it('calculates LONG gross and net P&L with fees', () => {
    const result = calculateJournalFinancials({
      direction: 'LONG',
      status: 'CLOSED',
      entryPrice: 100,
      exitPrice: 110,
      quantity: 10,
      fees: 15
    });
    assert.equal(result.investedAmount, 1000);
    assert.equal(result.exitValue, 1100);
    assert.equal(result.grossPnl, 100);
    assert.equal(result.netPnl, 85);
    assert.equal(result.returnPercent, 8.5);
  });

  it('calculates SHORT gross and net P&L with fees', () => {
    const result = calculateJournalFinancials({
      direction: 'SHORT',
      status: 'CLOSED',
      entryPrice: 50,
      exitPrice: 40,
      quantity: 8,
      fees: 4
    });
    assert.equal(result.grossPnl, 80);
    assert.equal(result.netPnl, 76);
    assert.equal(result.returnPercent, 19);
  });

  it('leaves P&L empty for open trades', () => {
    const result = calculateJournalFinancials({
      direction: 'LONG',
      status: 'OPEN',
      entryPrice: 20,
      quantity: 5,
      fees: 2
    });
    assert.equal(result.investedAmount, 100);
    assert.equal(result.exitValue, null);
    assert.equal(result.grossPnl, null);
    assert.equal(result.netPnl, null);
    assert.equal(result.returnPercent, null);
  });

  it('does not divide by zero for return percent', () => {
    const result = calculateJournalFinancials({
      direction: 'LONG',
      status: 'CLOSED',
      entryPrice: 0,
      exitPrice: 10,
      quantity: 2,
      fees: 0
    });
    assert.equal(result.investedAmount, 0);
    assert.equal(result.returnPercent, null);
  });

  it('computes risk/reward from stop and target', () => {
    const result = calculateJournalFinancials({
      direction: 'LONG',
      status: 'OPEN',
      entryPrice: 100,
      quantity: 2,
      stopLoss: 90,
      target: 130
    });
    assert.equal(result.riskAmount, 20);
    assert.equal(result.rewardAmount, 60);
    assert.equal(result.riskRewardRatio, 3);
  });
});
