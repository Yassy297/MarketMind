import React from 'react';

type StockHeaderProps = {
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
  isin?: string;
  country?: string;
  currency?: string;
  loading?: boolean;
};

const StockHeader: React.FC<StockHeaderProps> = ({
  symbol,
  name,
  exchange,
  sector,
  isin,
  country,
  currency,
  loading = false
}) => {
  return (
    <div className="rounded-2xl border border-white/6 bg-ink-900/80 p-6 shadow-card">
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {exchange ? (
              <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
                {exchange}
              </span>
            ) : null}
            {sector ? (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300">
                {sector}
              </span>
            ) : null}
            <span className="text-sm text-slate-500">{symbol}</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{name}</h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
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
