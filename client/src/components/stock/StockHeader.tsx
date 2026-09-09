import React, { type ReactNode } from 'react';

type StockHeaderProps = {
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
  isin?: string;
  country?: string;
  currency?: string;
  loading?: boolean;
  action?: ReactNode;
};

const StockHeader: React.FC<StockHeaderProps> = ({
  symbol,
  name,
  exchange,
  sector,
  isin,
  country,
  currency,
  loading = false,
  action
}) => {
  return (
    <div className="mm-card p-6">
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
          <div className="h-8 w-48 animate-pulse rounded bg-surface-hover" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {exchange ? (
                <span className="rounded-md bg-brand-subtle px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand">
                  {exchange}
                </span>
              ) : null}
              {sector ? (
                <span className="rounded-md bg-surface-hover px-2 py-0.5 text-xs font-medium text-fg-secondary">
                  {sector}
                </span>
              ) : null}
              <span className="text-sm text-fg-muted">{symbol}</span>
            </div>
            {action}
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg">{name}</h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
            {isin ? <span>ISIN {isin}</span> : null}
            {country ? <span>{country}</span> : null}
            {currency ? <span>{currency}</span> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default StockHeader;
