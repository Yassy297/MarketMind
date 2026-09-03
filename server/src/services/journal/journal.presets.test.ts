import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { persistPresetOrCustom, resolvePresetOrCustom } from './journal.presets';

const strategies = ['Trend Following', 'Breakout', 'Other'] as const;

describe('journal preset / custom values', () => {
  it('keeps a predefined strategy selected', () => {
    assert.deepEqual(resolvePresetOrCustom('Trend Following', strategies), {
      selected: 'Trend Following',
      custom: ''
    });
  });

  it('maps unknown and historical free-text values to Custom', () => {
    assert.deepEqual(resolvePresetOrCustom('VWAP fade', strategies), {
      selected: 'Custom',
      custom: 'VWAP fade'
    });
  });

  it('persists the custom value, not the word Custom', () => {
    assert.equal(persistPresetOrCustom('Custom', '  Opening range  '), 'Opening range');
    assert.equal(persistPresetOrCustom('Custom', '   '), undefined);
    assert.equal(persistPresetOrCustom('Breakout', ''), 'Breakout');
  });

  it('preserves a custom value when editing', () => {
    const loaded = resolvePresetOrCustom('My own setup', ['Breakout', 'Pullback']);
    assert.equal(loaded.selected, 'Custom');
    assert.equal(persistPresetOrCustom(loaded.selected, loaded.custom), 'My own setup');
  });
});
