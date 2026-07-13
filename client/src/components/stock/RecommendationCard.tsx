import React from 'react';

type RecommendationCardProps = {
  buy: number;
  hold: number;
  sell: number;
  period: string;
  loading?: boolean;
};

const rows: Array<{ key: 'buy' | 'hold' | 'sell'; label: string; barClass: string }> = [
  { key: 'buy', label: 'Buy', barClass: 'bg-emerald-400' },
  { key: 'hold', label: 'Hold', barClass: 'bg-amber-400' },
  { key: 'sell', label: 'Sell', barClass: 'bg-rose-400' }
];

const RecommendationCard: React.FC<RecommendationCardProps> = ({ buy, hold, sell, period, loading = false }) => {
  const values = { buy, hold, sell };
  const max = Math.max(buy, hold, sell, 1);

  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
      <div className="text-sm font-medium text-slate-300">Analyst recommendation</div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 animate-pulse rounded bg-white/5" />
          <div className="h-4 animate-pulse rounded bg-white/5" />
          <div className="h-4 animate-pulse rounded bg-white/5" />
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {rows.map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex justify-between text-sm text-slate-300">
                  <span>{row.label}</span>
                  <span className="font-medium text-white">{values[row.key]}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${(values[row.key] / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs uppercase tracking-wider text-slate-500">Period: {period}</div>
        </>
      )}
    </div>
  );
};

export default RecommendationCard;
