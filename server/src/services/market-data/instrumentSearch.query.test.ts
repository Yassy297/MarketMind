import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeInstrumentSearchQuery } from './instrumentSearch.query';
import { searchWithProviders } from './instrumentSearch.service';
import type { SearchResult } from './marketData.types';

const sample = (symbol: string): SearchResult => ({
  symbol,
  displaySymbol: symbol,
  description: symbol,
  type: 'Equity',
  companyName: 'HDFC Bank Limited',
  exchange: 'NSE',
  exchangeCode: 'NSE_EQ',
  market: 'IN',
  countryCode: 'IN',
  countryName: 'India',
  currency: 'INR',
  isin: 'INE040A01034',
  instrumentType: 'EQ',
  provider: 'upstox'
});

describe('normalizeInstrumentSearchQuery', () => {
  it('treats hdfc, HDFC, and Hdfc as the same query', () => {
    assert.equal(normalizeInstrumentSearchQuery('hdfc'), 'HDFC');
    assert.equal(normalizeInstrumentSearchQuery('HDFC'), 'HDFC');
    assert.equal(normalizeInstrumentSearchQuery('Hdfc'), 'HDFC');
    assert.equal(normalizeInstrumentSearchQuery('hDfC'), 'HDFC');
  });

  it('trims and collapses whitespace', () => {
    assert.equal(normalizeInstrumentSearchQuery('  hdfc  '), 'HDFC');
    assert.equal(normalizeInstrumentSearchQuery('hdfc   bank'), 'HDFC BANK');
  });

  it('returns empty for blank input', () => {
    assert.equal(normalizeInstrumentSearchQuery('   '), '');
    assert.equal(normalizeInstrumentSearchQuery(''), '');
  });

  it('preserves special characters after trim', () => {
    assert.equal(normalizeInstrumentSearchQuery('  aapl.ns  '), 'AAPL.NS');
  });
});

describe('searchWithProviders', () => {
  it('sends the same normalized query for every case variant', async () => {
    const received: string[] = [];
    const provider = {
      async search(query: string) {
        received.push(query);
        return [sample('HDFCBANK.NS')];
      }
    };

    const lower = await searchWithProviders('hdfc', { market: 'IN' }, [provider]);
    const upper = await searchWithProviders('HDFC', { market: 'IN' }, [provider]);
    const mixed = await searchWithProviders('  Hdfc  ', { market: 'IN' }, [provider]);

    assert.deepEqual(received, ['HDFC', 'HDFC', 'HDFC']);
    assert.deepEqual(
      lower.map((item) => item.symbol),
      upper.map((item) => item.symbol)
    );
    assert.deepEqual(
      lower.map((item) => item.symbol),
      mixed.map((item) => item.symbol)
    );
  });

  it('does not call providers for an empty query', async () => {
    let called = false;
    await searchWithProviders('   ', {}, [
      {
        async search() {
          called = true;
          return [];
        }
      }
    ]);
    assert.equal(called, false);
  });
});
