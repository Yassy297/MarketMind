/**
 * Canonical search-query normalization used by every market-data provider path.
 * The UI keeps the user's typed value; providers receive this form.
 */
export const normalizeInstrumentSearchQuery = (query: string): string =>
  query.trim().replace(/\s+/g, ' ').toLocaleUpperCase('en-US');
