import React from 'react';
import { ArrowUpRight } from 'lucide-react';

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
      className="group w-full rounded-xl border border-white/6 bg-white/[0.02] p-3.5 text-left transition hover:border-violet-500/40 hover:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-white">{symbol}</div>
          <div className="mt-0.5 truncate text-sm text-slate-400">{description}</div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-violet-300" />
      </div>
    </button>
  );
};

export default StockCard;
