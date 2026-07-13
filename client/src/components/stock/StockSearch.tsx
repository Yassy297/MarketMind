import React from 'react';
import { Search } from 'lucide-react';
import Button from '../ui/button';

type StockSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

const StockSearch: React.FC<StockSearchProps> = ({ query, onQueryChange, onSubmit, loading = false }) => {
  return (
    <form
      className="rounded-2xl border border-white/6 bg-ink-900/80 p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block text-sm font-medium text-slate-300">Search companies</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search AAPL, MSFT, NVDA..."
            className="w-full rounded-lg border border-white/8 bg-ink-950/60 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  );
};

export default StockSearch;
