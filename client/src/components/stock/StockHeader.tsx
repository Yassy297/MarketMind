import React from 'react';

type StockHeaderProps = {
  symbol: string;
  name: string;
  exchange: string;
  loading?: boolean;
};

const StockHeader: React.FC<StockHeaderProps> = ({ symbol, name, exchange, loading = false }) => {
  return (
    <div className="rounded-2xl border border-white/6 bg-ink-900/80 p-6 shadow-card">
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-violet-300">{exchange}</span>
            <span className="text-sm text-slate-500">{symbol}</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{name}</h2>
        </>
      )}
    </div>
  );
};

export default StockHeader;
