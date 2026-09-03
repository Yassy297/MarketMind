import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import Button from '../ui/button';
import type { SearchResult } from '../../services/stock.service';

type StockSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onSelect: (result: SearchResult) => void;
  onSearchRequest: () => void;
  results: SearchResult[];
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
};

const StockSearch: React.FC<StockSearchProps> = ({
  query,
  onQueryChange,
  onSubmit,
  onSelect,
  onSearchRequest,
  results,
  loading = false,
  error = false,
  errorMessage = 'Unable to search stocks.'
}) => {
  const searchAreaRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const visibleResults = results.slice(0, 10);
  const showDropdown = isOpen && query.trim().length > 0;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!searchAreaRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    setHighlightedIndex(visibleResults.length > 0 ? 0 : -1);
  }, [visibleResults.length]);

  const selectResult = (result: SearchResult) => {
    onSelect(result);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  let dropdownContent: React.ReactNode;
  if (loading) {
    dropdownContent = (
      <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
        Searching companies...
      </div>
    );
  } else if (error) {
    dropdownContent = <div className="px-3 py-3 text-sm text-rose-300">{errorMessage}</div>;
  } else if (visibleResults.length === 0) {
    dropdownContent = <div className="px-3 py-3 text-sm text-slate-400">No companies found</div>;
  } else {
    dropdownContent = visibleResults.map((result, index) => (
      <button
        key={`${result.symbol}-${result.displaySymbol}`}
        id={`stock-search-option-${index}`}
        type="button"
        role="option"
        aria-selected={highlightedIndex === index}
        onMouseEnter={() => setHighlightedIndex(index)}
        onClick={() => selectResult(result)}
        className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition ${
          highlightedIndex === index ? 'bg-violet-500/15' : 'hover:bg-white/[0.04]'
        }`}
      >
        <span className="min-w-0">
          <span className="block font-semibold text-white">{result.displaySymbol || result.symbol}</span>
          <span className="block truncate text-sm text-slate-400">{result.companyName || result.description}</span>
        </span>
        {result.exchange || result.countryName ? (
          <span className="shrink-0 text-right text-xs text-slate-500">
            <span className="block uppercase tracking-wider">{result.exchange || result.instrumentType}</span>
            {result.countryName ? <span className="block">{result.countryName}</span> : null}
          </span>
        ) : null}
      </button>
    ));
  }

  return (
    <form
      ref={searchAreaRef}
      className="rounded-2xl border border-white/6 bg-ink-900/80 p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
        setIsOpen(false);
      }}
    >
      <label htmlFor="stock-company-search" className="block text-sm font-medium text-slate-300">
        Search companies
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="stock-company-search"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setIsOpen(event.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (query.trim()) {
                setIsOpen(true);
                onSearchRequest();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && visibleResults.length > 0) {
                event.preventDefault();
                setIsOpen(true);
                setHighlightedIndex((current) => (current + 1) % visibleResults.length);
              } else if (event.key === 'ArrowUp' && visibleResults.length > 0) {
                event.preventDefault();
                setIsOpen(true);
                setHighlightedIndex((current) => (current <= 0 ? visibleResults.length - 1 : current - 1));
              } else if (event.key === 'Enter' && showDropdown && highlightedIndex >= 0) {
                event.preventDefault();
                selectResult(visibleResults[highlightedIndex]);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
              }
            }}
            placeholder="Search AAPL, MSFT, NVDA..."
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="stock-search-results"
            aria-activedescendant={highlightedIndex >= 0 ? `stock-search-option-${highlightedIndex}` : undefined}
            className={`w-full border border-white/8 bg-ink-950/60 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 ${
              showDropdown ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'
            }`}
          />
          {showDropdown ? (
            <div
              id="stock-search-results"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 max-h-80 overflow-y-auto rounded-b-lg border border-t-0 border-white/10 bg-ink-950/95 p-1.5 shadow-2xl backdrop-blur-xl"
            >
              {dropdownContent}
            </div>
          ) : null}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  );
};

export default StockSearch;
