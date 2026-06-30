import React from 'react';

type StockCardProps = {
  symbol: string;
  description: string;
  onSelect: (symbol: string) => void;
};

const StockCard: React.FC<StockCardProps> = ({ symbol, description, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(symbol)}
      className="w-full rounded-lg border border-gray-800 bg-gray-900/80 p-4 text-left transition hover:border-indigo-500"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-white">{symbol}</div>
          <div className="mt-1 text-sm text-gray-400">{description}</div>
        </div>
        <span className="text-sm text-indigo-400">Open</span>
      </div>
    </button>
  );
};

export default StockCard;
