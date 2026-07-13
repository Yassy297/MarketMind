import React from 'react';

type RecommendationCardProps = {
  buy: number;
  hold: number;
  sell: number;
  period: string;
  loading?: boolean;
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ buy, hold, sell, period, loading = false }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
      <div className="text-sm text-gray-400">Analyst recommendation</div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 animate-pulse rounded bg-gray-800" />
          <div className="h-4 animate-pulse rounded bg-gray-800" />
          <div className="h-4 animate-pulse rounded bg-gray-800" />
        </div>
      ) : (
        <>
          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <div className="flex justify-between"><span>Buy</span><span>{buy}</span></div>
            <div className="flex justify-between"><span>Hold</span><span>{hold}</span></div>
            <div className="flex justify-between"><span>Sell</span><span>{sell}</span></div>
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">Period: {period}</div>
        </>
      )}
    </div>
  );
};

export default RecommendationCard;
