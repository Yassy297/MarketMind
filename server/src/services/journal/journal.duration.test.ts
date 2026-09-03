import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateHoldingDuration, formatHoldingDurationLabel } from './journal.duration';

describe('holding duration', () => {
  it('formats completed closed-trade duration', () => {
    const result = calculateHoldingDuration({
      status: 'CLOSED',
      entryDate: '2026-08-01',
      entryTime: '09:15',
      exitDate: '2026-08-01',
      exitTime: '11:50'
    });
    assert.equal(result.holdingDurationStatus, 'completed');
    assert.equal(result.holdingDurationLabel, '2h 35m');
    assert.equal(result.holdingDurationMs, (2 * 60 + 35) * 60000);
  });

  it('formats multi-day closed duration', () => {
    const result = calculateHoldingDuration({
      status: 'CLOSED',
      entryDate: '2026-08-01',
      entryTime: '10:00',
      exitDate: '2026-08-04',
      exitTime: '14:00'
    });
    assert.equal(result.holdingDurationLabel, '3d 4h');
  });

  it('labels open trades as current elapsed time', () => {
    const result = calculateHoldingDuration({
      status: 'OPEN',
      entryDate: '2026-08-01',
      entryTime: '10:00',
      now: new Date('2026-08-01T12:00:00')
    });
    assert.equal(result.holdingDurationStatus, 'open');
    assert.equal(result.holdingDurationLabel, 'Currently open · 2h');
  });

  it('does not invent a completed duration for open trades', () => {
    const result = calculateHoldingDuration({
      status: 'OPEN',
      entryDate: '2026-08-01',
      now: new Date('2026-08-01T10:30:00')
    });
    assert.notEqual(result.holdingDurationStatus, 'completed');
    assert.match(result.holdingDurationLabel ?? '', /Currently open/);
  });

  it('returns empty duration when closed exit is missing', () => {
    const result = calculateHoldingDuration({
      status: 'CLOSED',
      entryDate: '2026-08-01'
    });
    assert.equal(result.holdingDurationMs, null);
    assert.equal(result.holdingDurationLabel, null);
  });

  it('formats a zero duration as minutes', () => {
    assert.equal(formatHoldingDurationLabel(0), '0m');
  });
});
