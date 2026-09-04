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
    <div className="rounded-xl border border-line bg-surface-hover p-4">
      <div className="text-sm font-medium text-fg-secondary">Analyst recommendation</div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 animate-pulse rounded bg-surface-hover" />
          <div className="h-4 animate-pulse rounded bg-surface-hover" />
          <div className="h-4 animate-pulse rounded bg-surface-hover" />
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {rows.map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex justify-between text-sm text-fg-secondary">
                  <span>{row.label}</span>
                  <span className="font-medium text-fg">{values[row.key]}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${(values[row.key] / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs uppercase tracking-wider text-fg-muted">Period: {period}</div>
        </>
      )}
    </div>
  );
};

export default RecommendationCard;
