import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketContext } from '../../context/MarketContext';
import { getStockErrorMessage, searchStocks, type SearchResult } from '../../services/stock.service';
import Input from '../ui/input';

type JournalInstrumentSearchProps = {
  id?: string;
  value: string;
  onQueryChange: (value: string) => void;
  onSelect: (result: SearchResult) => void;
  allowCustom?: boolean;
};

const JournalInstrumentSearch = ({
  id,
  value,
  onQueryChange,
  onSelect,
  allowCustom = true
}: JournalInstrumentSearchProps) => {
  const listId = useId();
  const { market, currency } = useMarketContext();
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [value]);

  const searchQuery = useQuery({
    queryKey: ['journal-instrument-search', market, currency, debounced],
    queryFn: () => searchStocks(debounced, { market, currency }),
    enabled: open && debounced.length > 0,
    retry: false
  });

  const results = (searchQuery.data ?? []).slice(0, 8);

  useEffect(() => {
    setHighlighted(results.length ? 0 : -1);
  }, [results.length, debounced]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  const selectResult = (result: SearchResult) => {
    onSelect(result);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => Math.min(results.length - 1, current + 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => Math.max(0, current - 1));
      return;
    }
    if (event.key === 'Enter' && open && highlighted >= 0 && results[highlighted]) {
      event.preventDefault();
      selectResult(results[highlighted]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && Boolean(value.trim())}
        aria-controls={listId}
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        placeholder="Search or type an instrument"
        onChange={(event) => {
          onQueryChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && value.trim() ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-white/8 bg-ink-950 shadow-card"
        >
          {searchQuery.isFetching ? (
            <div className="px-3 py-3 text-sm text-slate-400">Searching…</div>
          ) : searchQuery.isError ? (
            <div className="px-3 py-3 text-sm text-amber-200">
              {getStockErrorMessage(searchQuery.error, 'Live search is unavailable. You can still type a custom name.')}
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-400">
              {allowCustom ? 'No market match. The typed name will be saved as a custom instrument.' : 'No matches.'}
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.symbol}-${result.exchange}`}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={highlighted === index}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm ${
                  highlighted === index ? 'bg-violet-500/15' : 'hover:bg-white/5'
                }`}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => selectResult(result)}
              >
                <span className="text-white">{result.companyName}</span>
                <span className="text-xs text-slate-500">
                  {result.displaySymbol}
                  {result.exchange ? ` · ${result.exchange}` : ''}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default JournalInstrumentSearch;
