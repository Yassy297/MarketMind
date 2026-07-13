import React from 'react';

type StockSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

const StockSearch: React.FC<StockSearchProps> = ({ query, onQueryChange, onSubmit, loading = false }) => {
  return (
    <form
      className="rounded-xl border border-gray-800 bg-gray-950/70 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block text-sm text-gray-400">Search companies</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search AAPL, MSFT, NVDA..."
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default StockSearch;
