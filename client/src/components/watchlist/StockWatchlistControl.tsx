import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import Button from '../ui/button';
import Dialog from '../ui/Dialog';
import WatchlistFormDialog from './WatchlistFormDialog';
import { useMarketContext } from '../../context/MarketContext';
import {
  addWatchlistItem,
  createWatchlist,
  fetchWatchlistMembership,
  fetchWatchlists,
  getWatchlistErrorMessage,
  invalidateWatchlistCaches,
  removeWatchlistItem
} from '../../services/watchlist.service';
import type { StockProfile } from '../../services/stock.service';
import type { AddWatchlistItemInput, WatchlistMembershipQuery } from '../../types/watchlist';
import { CURRENCIES, type CurrencyCode, type MarketCode } from '../../config/markets';

type StockWatchlistControlProps = {
  symbol: string;
  market: MarketCode | null;
  profile?: StockProfile;
};

const isCurrencyCode = (value: string): value is CurrencyCode => value in CURRENCIES;

const StockWatchlistControl = ({ symbol, market, profile }: StockWatchlistControlProps) => {
  const queryClient = useQueryClient();
  const { currency } = useMarketContext();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const itemInput: AddWatchlistItemInput = {
    symbol,
    displaySymbol: profile?.ticker || symbol,
    companyName: profile?.name || symbol,
    market: market ?? undefined,
    exchange: profile?.exchange || undefined,
    countryCode: market ?? undefined,
    currency: profile?.currency && isCurrencyCode(profile.currency) ? profile.currency : currency ?? undefined,
    isin: profile?.isin,
    instrumentKey: profile?.instrumentKey
  };

  const membershipQuery: WatchlistMembershipQuery = {
    symbol,
    market,
    exchange: profile?.exchange || undefined,
    isin: profile?.isin,
    instrumentKey: profile?.instrumentKey
  };

  const listsQuery = useQuery({
    queryKey: ['watchlists'],
    queryFn: fetchWatchlists,
    enabled: open,
    retry: false
  });

  const membership = useQuery({
    queryKey: ['watchlist-membership', symbol, market, profile?.exchange, profile?.isin, profile?.instrumentKey],
    queryFn: () => fetchWatchlistMembership(membershipQuery),
    enabled: Boolean(symbol),
    retry: false
  });

  const memberships = membership.data?.memberships ?? [];
  const memberIds = useMemo(() => new Set(memberships.map((item) => item.watchlistId)), [memberships]);

  const addMutation = useMutation({
    mutationFn: (watchlistId: string) => addWatchlistItem(watchlistId, itemInput),
    onMutate: (watchlistId) => {
      setPendingId(watchlistId);
      setActionError(null);
    },
    onSuccess: () => invalidateWatchlistCaches(queryClient),
    onError: (error) => setActionError(getWatchlistErrorMessage(error, 'Unable to add to that watchlist.')),
    onSettled: () => setPendingId(null)
  });

  const removeMutation = useMutation({
    mutationFn: ({ watchlistId, itemId }: { watchlistId: string; itemId: string }) =>
      removeWatchlistItem(watchlistId, itemId),
    onMutate: ({ watchlistId }) => {
      setPendingId(watchlistId);
      setActionError(null);
    },
    onSuccess: () => invalidateWatchlistCaches(queryClient),
    onError: (error) => setActionError(getWatchlistErrorMessage(error, 'Unable to remove from that watchlist.')),
    onSettled: () => setPendingId(null)
  });

  const createMutation = useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      const created = await createWatchlist({
        name: input.name,
        description: input.description || undefined
      });
      await addWatchlistItem(created.id, itemInput);
      return created;
    },
    onSuccess: () => {
      invalidateWatchlistCaches(queryClient);
      setCreating(false);
    }
  });

  const label =
    memberships.length === 0
      ? 'Add to Watchlist'
      : memberships.length === 1
        ? `In ${memberships[0]?.watchlistName}`
        : `Added to ${memberships.length} watchlists`;

  const toggle = (watchlistId: string) => {
    const existing = memberships.find((item) => item.watchlistId === watchlistId);
    if (existing) {
      removeMutation.mutate({ watchlistId, itemId: existing.itemId });
      return;
    }
    addMutation.mutate(watchlistId);
  };

  return (
    <>
      <Button
        type="button"
        variant={memberships.length ? 'secondary' : 'primary'}
        onClick={() => {
          setOpen(true);
          setActionError(null);
        }}
        aria-haspopup="dialog"
      >
        <Star className={`h-4 w-4 ${memberships.length ? 'fill-current text-brand' : ''}`} />
        {membership.isLoading ? 'Watchlists' : label}
      </Button>

      <Dialog
        open={open}
        title="Watchlists"
        description="Add this instrument to one or more of your lists, or create a new one."
        onClose={() => setOpen(false)}
        footer={
          <Button type="button" variant="secondary" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            New watchlist
          </Button>
        }
      >
        {listsQuery.isError ? (
          <p className="mm-alert-error" role="alert">
            {getWatchlistErrorMessage(listsQuery.error, 'Unable to load watchlists.')}
          </p>
        ) : listsQuery.isLoading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
            <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
          </div>
        ) : (listsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-fg-secondary">You have not created a watchlist yet.</p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-auto">
            {(listsQuery.data ?? []).map((watchlist) => {
              const checked = memberIds.has(watchlist.id);
              const inputId = `watchlist-member-${watchlist.id}`;
              return (
                <li key={watchlist.id}>
                  <label
                    htmlFor={inputId}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 hover:bg-surface-hover"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-brand"
                      checked={checked}
                      disabled={pendingId === watchlist.id}
                      onChange={() => toggle(watchlist.id)}
                    />
                    <span>
                      <span className="block font-medium text-fg">{watchlist.name}</span>
                      <span className="block text-xs text-fg-muted">
                        {watchlist.itemCount} {watchlist.itemCount === 1 ? 'instrument' : 'instruments'}
                        {watchlist.description ? ` · ${watchlist.description}` : ''}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        {actionError ? (
          <p className="mt-3 text-sm text-warning" role="alert">
            {actionError}
          </p>
        ) : null}
      </Dialog>

      <WatchlistFormDialog
        open={creating}
        mode="create"
        submitting={createMutation.isPending}
        error={
          createMutation.isError
            ? getWatchlistErrorMessage(createMutation.error, 'Unable to create watchlist.')
            : null
        }
        onClose={() => {
          setCreating(false);
          createMutation.reset();
        }}
        onSubmit={(input) => createMutation.mutate(input)}
      />
    </>
  );
};

export default StockWatchlistControl;
