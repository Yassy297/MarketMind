export type MarketDataErrorCode =
  | 'INSTRUMENT_NOT_FOUND'
  | 'MARKET_PROVIDER_UNAVAILABLE'
  | 'PROVIDER_AUTHENTICATION_FAILED'
  | 'COMPANY_PROFILE_UNAVAILABLE'
  | 'QUOTE_UNAVAILABLE'
  | 'FUNDAMENTALS_UNAVAILABLE'
  | 'TEMPORARY_PROVIDER_ERROR';

const STATUS_BY_CODE: Record<MarketDataErrorCode, number> = {
  INSTRUMENT_NOT_FOUND: 404,
  MARKET_PROVIDER_UNAVAILABLE: 503,
  PROVIDER_AUTHENTICATION_FAILED: 502,
  COMPANY_PROFILE_UNAVAILABLE: 404,
  QUOTE_UNAVAILABLE: 502,
  FUNDAMENTALS_UNAVAILABLE: 404,
  TEMPORARY_PROVIDER_ERROR: 502
};

export class MarketDataError extends Error {
  readonly status: number;

  constructor(
    readonly code: MarketDataErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'MarketDataError';
    this.status = STATUS_BY_CODE[code];
  }
}
