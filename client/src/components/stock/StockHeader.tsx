import React from 'react';

type StockHeaderProps = {
  symbol: string;
  name: string;
  exchange: string;
  loading?: boolean;
};

const StockHeader: React.FC<StockHeaderProps> = ({ symbol, name, exchange, loading = false }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-6">
      {loading ? (
        <div className="space-y-3">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-800" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-800" />
        </div>
      ) : (
        <>
          <div className="text-sm uppercase tracking-[0.2em] text-indigo-400">{exchange}</div>
          <h2 className="mt-2 text-3xl font-semibold text-white">{name}</h2>
          <div className="mt-2 text-sm text-gray-400">{symbol}</div>
        </>
      )}
    </div>
  );
};

export default StockHeader;
