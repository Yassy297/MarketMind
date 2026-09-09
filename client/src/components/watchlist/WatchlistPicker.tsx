import { Pencil, Trash2 } from 'lucide-react';
import type { WatchlistSummary } from '../../types/watchlist';
import Select from '../ui/select';
import Button from '../ui/button';

type WatchlistPickerProps = {
  watchlists: WatchlistSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (watchlist: WatchlistSummary) => void;
  onDelete: (watchlist: WatchlistSummary) => void;
};

const WatchlistPicker = ({ watchlists, selectedId, onSelect, onEdit, onDelete }: WatchlistPickerProps) => {
  const selected = watchlists.find((item) => item.id === selectedId);

  return (
    <>
      <div className="lg:hidden">
        <label className="sr-only" htmlFor="watchlist-mobile-select">
          Selected watchlist
        </label>
        <Select
          id="watchlist-mobile-select"
          value={selectedId ?? ''}
          onChange={(event) => onSelect(event.target.value)}
        >
          {watchlists.map((watchlist) => (
            <option key={watchlist.id} value={watchlist.id}>
              {watchlist.name} ({watchlist.itemCount})
            </option>
          ))}
        </Select>
        {selected ? (
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-sm text-fg-muted">{selected.description || 'No description'}</p>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="icon" size="sm" aria-label={`Edit ${selected.name}`} onClick={() => onEdit(selected)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="icon" size="sm" aria-label={`Delete ${selected.name}`} onClick={() => onDelete(selected)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <nav className="hidden space-y-2 lg:block" aria-label="Watchlists">
        {watchlists.map((watchlist) => {
          const active = watchlist.id === selectedId;
          return (
            <div
              key={watchlist.id}
              className={`rounded-xl border p-3 transition ${
                active ? 'border-brand/40 bg-brand-subtle' : 'border-line bg-surface hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => onSelect(watchlist.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-fg">{watchlist.name}</span>
                    <span className="shrink-0 text-xs text-fg-muted">{watchlist.itemCount}</span>
                  </div>
                  {watchlist.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{watchlist.description}</p>
                  ) : null}
                </button>
                <div className="flex shrink-0 flex-col">
                  <Button type="button" variant="icon" size="sm" aria-label={`Edit ${watchlist.name}`} onClick={() => onEdit(watchlist)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" variant="icon" size="sm" aria-label={`Delete ${watchlist.name}`} onClick={() => onDelete(watchlist)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
};

export default WatchlistPicker;
