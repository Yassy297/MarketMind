export type UpstoxApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
};

export type UpstoxMoneySummary = {
  value?: number;
  unit?: string;
  formatted?: string;
};

export type UpstoxCompanyProfile = {
  company_profile?: string;
  sector?: string;
  sector_market_cap_inr?: UpstoxMoneySummary;
  sector_market_cap_usd?: UpstoxMoneySummary;
};

export type UpstoxRatio = {
  name?: string;
  company_value?: string;
  sector_value?: string;
};

export type UpstoxHistoryPoint = {
  value?: number;
  period?: string;
  change?: string;
};

export type UpstoxCategorySeries = {
  category?: string;
  history?: UpstoxHistoryPoint[];
};

export type UpstoxDetailedSeries = {
  particular?: string;
  history?: UpstoxHistoryPoint[];
};

export type UpstoxIncomeStatement = {
  type?: string;
  time_period?: string;
  units_in?: string;
  income_statement?: UpstoxCategorySeries[];
  full_statement?: UpstoxDetailedSeries[];
};

export type UpstoxBalanceHistory = {
  total_asset?: number;
  total_liability?: number;
  period?: string;
};

export type UpstoxBalanceSheet = {
  type?: string;
  time_period?: string;
  units_in?: string;
  history?: UpstoxBalanceHistory[];
  full_statement?: UpstoxDetailedSeries[];
};

export type UpstoxCashFlow = {
  type?: string;
  time_period?: string;
  units_in?: string;
  cash_flow?: UpstoxCategorySeries[];
  full_statement?: UpstoxDetailedSeries[];
};

export type UpstoxShareholdingCategory = {
  category?: string;
  history?: UpstoxHistoryPoint[];
};

export type UpstoxEventDetail = {
  name?: string;
  value?: string;
};

export type UpstoxCorporateAction = {
  name?: string;
  expiry_date?: string;
  amount?: number | null;
  ratio?: string | null;
  event_details?: UpstoxEventDetail[];
};

export type UpstoxCompetitor = {
  instrument_key?: string;
  company_profile?: string;
  sector?: string;
  sector_market_cap_inr?: UpstoxMoneySummary;
  sector_market_cap_usd?: UpstoxMoneySummary;
};

export type UpstoxQuote = {
  ohlc?: {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  };
  timestamp?: string;
  instrument_token?: string;
  symbol?: string;
  last_price?: number;
  net_change?: number;
};
