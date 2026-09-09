import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';
import EmptyState from '../components/ui/EmptyState';
import WatchlistDeleteDialog from '../components/watchlist/WatchlistDeleteDialog';
import WatchlistFormDialog from '../components/watchlist/WatchlistFormDialog';
import WatchlistItemsPanel from '../components/watchlist/WatchlistItemsPanel';
import WatchlistPicker from '../components/watchlist/WatchlistPicker';
import JournalInstrumentSearch from '../components/journal/JournalInstrumentSearch';
import { useMarketContext } from '../context/MarketContext';
import {
  addWatchlistItem,
  createWatchlist,
  deleteWatchlist,
  fetchWatchlistItems,
  fetchWatchlists,
  getWatchlistErrorMessage,
  invalidateWatchlistCaches,
  removeWatchlistItem,
  toWatchlistItemInput,
  updateWatchlist
} from '../services/watchlist.service';
import { fetchStockSnapshots, getStockErrorMessage, type SearchResult } from '../services/stock.service';
import type { WatchlistSummary } from '../types/watchlist';

const Watchlist: React.FC = () => {
  const queryClient = useQueryClient();
  const { currency } = useMarketContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get('list');
  const [searchValue, setSearchValue] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; watchlist?: WatchlistSummary } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WatchlistSummary | null>(null);

  const listsQuery = useQuery({
    queryKey: ['watchlists'],
    queryFn: fetchWatchlists,
    retry: false
  });

  const watchlists = listsQuery.data ?? [];
  const selectedId =
    (requestedId && watchlists.some((item) => item.id === requestedId) ? requestedId : watchlists[0]?.id) ?? null;
  const selected = watchlists.find((item) => item.id === selectedId) ?? null;

  const itemsQuery = useQuery({
    queryKey: ['watchlist-items', selectedId],
    queryFn: () => fetchWatchlistItems(selectedId as string),
    enabled: Boolean(selectedId),
    retry: false
  });

  const items = itemsQuery.data?.items ?? [];
  const snapshotKey = items.map((item) => `${item.symbol}:${item.market ?? ''}`).join('|');

  const snapshotsQuery = useQuery({
    queryKey: ['watchlist-snapshots', currency, snapshotKey],
    queryFn: () =>
      fetchStockSnapshots(
        items.map((item) => ({ symbol: item.symbol, market: item.market })),
        currency
      ),
    enabled: items.length > 0,
    staleTime: 30_000,
    retry: false
  });

  const selectList = (id: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('list', id);
      return next;
    });
    setAddError(null);
    setSearchValue('');
  };

  const createMutation = useMutation({
    mutationFn: createWatchlist,
    onSuccess: (created) => {
      invalidateWatchlistCaches(queryClient);
      setFormState(null);
      selectList(created.id);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, description }: { id: string; name: string; description: string }) =>
      updateWatchlist(id, { name, description }),
    onSuccess: () => {
      invalidateWatchlistCaches(queryClient);
      setFormState(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWatchlist,
    onSuccess: (_, deletedId) => {
      const remaining = watchlists.filter((item) => item.id !== deletedId);
      invalidateWatchlistCaches(queryClient);
      setDeleteTarget(null);
      if (remaining[0]) selectList(remaining[0].id);
      else setSearchParams({});
    }
  });

  const addMutation = useMutation({
    mutationFn: (result: SearchResult) => addWatchlistItem(selectedId as string, toWatchlistItemInput(result)),
    onSuccess: () => {
      invalidateWatchlistCaches(queryClient);
      setSearchValue('');
      setAddError(null);
    },
    onError: (error) => {
      setAddError(getWatchlistErrorMessage(error, 'Unable to add this instrument.'));
    }
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeWatchlistItem(selectedId as string, itemId),
    onSuccess: () => {
      invalidateWatchlistCaches(queryClient);
    }
  });

  const formError = useMemo(() => {
    if (createMutation.isError) return getWatchlistErrorMessage(createMutation.error, 'Unable to create watchlist.');
    if (updateMutation.isError) return getWatchlistErrorMessage(updateMutation.error, 'Unable to update watchlist.');
    return null;
  }, [createMutation.error, createMutation.isError, updateMutation.error, updateMutation.isError]);

  return (
    <div className="mm-page">
      <PageHeader
        title="My Watchlists"
        subtitle="Track and organize the companies and instruments you're researching."
        action={
          <Button type="button" onClick={() => setFormState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            New Watchlist
          </Button>
        }
      />

      {listsQuery.isError ? (
        <div className="mm-alert-error" role="alert">
          {getWatchlistErrorMessage(listsQuery.error, 'Unable to load watchlists.')}{' '}
          <button type="button" className="underline" onClick={() => void listsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {listsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-surface-hover" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-surface-hover" />
        </div>
      ) : watchlists.length === 0 ? (
        <div className="mm-card">
          <EmptyState
            icon={Star}
            title="You haven't created a watchlist yet."
            description="Create a list to organize the instruments you want to keep researching."
            action={
              <Button type="button" onClick={() => setFormState({ mode: 'create' })}>
                Create your first watchlist
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="mm-card lg:sticky lg:top-4 lg:self-start">
            <WatchlistPicker
              watchlists={watchlists}
              selectedId={selectedId}
              onSelect={selectList}
              onEdit={(watchlist) => setFormState({ mode: 'edit', watchlist })}
              onDelete={setDeleteTarget}
            />
          </aside>

          <section className="space-y-4">
            <div className="mm-card space-y-3">
              <div>
                <h2 className="text-section-title text-fg">{selected?.name}</h2>
                {selected?.description ? <p className="mt-1 text-sm text-fg-secondary">{selected.description}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm text-fg-secondary" htmlFor="watchlist-add-stock">
                  Add stock
                </label>
                <JournalInstrumentSearch
                  id="watchlist-add-stock"
                  value={searchValue}
                  allowCustom={false}
                  onQueryChange={(value) => {
                    setSearchValue(value);
                    setAddError(null);
                  }}
                  onSelect={(result) => addMutation.mutate(result)}
                />
                {addMutation.isPending ? <p className="mt-2 text-sm text-fg-muted">Adding instrument…</p> : null}
                {addError ? (
                  <p className="mt-2 text-sm text-warning" role="alert">
                    {addError}
                  </p>
                ) : null}
              </div>
            </div>

            {itemsQuery.isError ? (
              <div className="mm-alert-error" role="alert">
                {getWatchlistErrorMessage(itemsQuery.error, 'Unable to load this watchlist.')}{' '}
                <button type="button" className="underline" onClick={() => void itemsQuery.refetch()}>
                  Retry
                </button>
              </div>
            ) : itemsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-surface-hover" />
                ))}
              </div>
            ) : (
              <WatchlistItemsPanel
                items={items}
                snapshots={snapshotsQuery.data ?? []}
                snapshotsLoading={snapshotsQuery.isFetching}
                snapshotsError={
                  snapshotsQuery.isError
                    ? getStockErrorMessage(snapshotsQuery.error, 'Live prices are temporarily unavailable.')
                    : null
                }
                currency={currency}
                removingId={removeMutation.isPending ? removeMutation.variables ?? null : null}
                onRemove={(item) => removeMutation.mutate(item.id)}
                addAction={
                  <Link
                    to="/stocks"
                    className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60"
                  >
                    Add stocks from Stock Intelligence
                  </Link>
                }
              />
            )}
          </section>
        </div>
      )}

      <WatchlistFormDialog
        open={Boolean(formState)}
        mode={formState?.mode ?? 'create'}
        initialName={formState?.watchlist?.name ?? ''}
        initialDescription={formState?.watchlist?.description ?? ''}
        submitting={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onClose={() => {
          setFormState(null);
          createMutation.reset();
          updateMutation.reset();
        }}
        onSubmit={({ name, description }) => {
          if (formState?.mode === 'edit' && formState.watchlist) {
            updateMutation.mutate({ id: formState.watchlist.id, name, description });
            return;
          }
          createMutation.mutate({ name, description: description || undefined });
        }}
      />

      <WatchlistDeleteDialog
        open={Boolean(deleteTarget)}
        name={deleteTarget?.name ?? ''}
        submitting={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? getWatchlistErrorMessage(deleteMutation.error, 'Unable to delete watchlist.')
            : null
        }
        onClose={() => {
          setDeleteTarget(null);
          deleteMutation.reset();
        }}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
};

export default Watchlist;
