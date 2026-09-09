import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, LineChart, Trash2 } from 'lucide-react';
import type { CurrencyCode } from '../../config/markets';
import type { WatchlistItem } from '../../types/watchlist';
import type { StockSnapshot } from '../../services/stock.service';
import {
  formatMarketCapitalization,
  formatMonetaryValue
} from '../../utils/currency';
import Button from '../ui/button';
import EmptyState from '../ui/EmptyState';

type WatchlistItemsPanelProps = {
  items: WatchlistItem[];
  snapshots: StockSnapshot[];
  snapshotsLoading: boolean;
  snapshotsError: string | null;
  currency: CurrencyCode | null;
  removingId: string | null;
  onRemove: (item: WatchlistItem) => void;
  addAction: ReactNode;
};

const dash = '—';

const snapshotFor = (item: WatchlistItem, snapshots: StockSnapshot[]) =>
  snapshots.find(
    (snapshot) =>
      snapshot.symbol === item.symbol &&
      (snapshot.market ?? '') === (item.market ?? '')
  ) ?? snapshots.find((snapshot) => snapshot.symbol === item.symbol);

const formatFreshness = (timestamp?: number) => {
  if (!timestamp) return dash;
  const millis = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const date = new Date(millis);
  if (Number.isNaN(date.getTime())) return dash;
  return date.toLocaleString();
};

const stockPath = (item: WatchlistItem) => {
  const params = new URLSearchParams({ symbol: item.symbol });
  if (item.market) params.set('market', item.market);
  return `/stocks?${params.toString()}`;
};

const WatchlistItemsPanel = ({
  items,
  snapshots,
  snapshotsLoading,
  snapshotsError,
  currency,
  removingId,
  onRemove,
  addAction
}: WatchlistItemsPanelProps) => {
  if (items.length === 0) {
    return (
      <div className="mm-card">
        <EmptyState
          icon={LineChart}
          title="This watchlist is empty."
          description="Add companies from Stock Intelligence or search above to start tracking this list."
          action={addAction}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {snapshotsError ? (
        <p className="mm-alert-warning" role="alert">
          {snapshotsError}
        </p>
      ) : null}

      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="mm-table min-w-[880px]">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Exchange</th>
                <th>Price</th>
                <th>Day change</th>
                <th>Market cap</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const snapshot = snapshotFor(item, snapshots);
                const quote = snapshot?.quote;
                const profile = snapshot?.profile;
                const sourceCurrency = quote?.sourceCurrency ?? profile?.currency ?? item.currency ?? '';
                const percent = quote?.percentChange;
                const up = (percent ?? 0) > 0;
                const down = (percent ?? 0) < 0;
                return (
                  <tr key={item.id}>
                    <td>
                      <Link
                        to={stockPath(item)}
                        className="font-medium text-fg hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50"
                      >
                        {item.displaySymbol}
                      </Link>
                      <div className="text-xs text-fg-muted">{item.companyName}</div>
                    </td>
                    <td>
                      {item.exchange || profile?.exchange || dash}
                      {item.market ? <div className="text-xs text-fg-muted">{item.market}</div> : null}
                    </td>
                    <td>
                      {snapshotsLoading && !quote
                        ? <span className="inline-block h-4 w-16 animate-pulse rounded bg-surface-hover" />
                        : quote
                          ? formatMonetaryValue(quote.currentPrice, sourceCurrency, currency, quote.monetary?.currentPrice)
                          : dash}
                    </td>
                    <td className={up ? 'text-positive' : down ? 'text-negative' : undefined}>
                      {snapshotsLoading && !quote ? (
                        <span className="inline-block h-4 w-20 animate-pulse rounded bg-surface-hover" />
                      ) : quote ? (
                        <>
                          {formatMonetaryValue(quote.change, sourceCurrency, currency, quote.monetary?.change)}{' '}
                          <span className="text-xs">
                            ({up ? '+' : ''}
                            {(percent ?? 0).toFixed(2)}%)
                          </span>
                          <span className="sr-only">{up ? ' up' : down ? ' down' : ' unchanged'}</span>
                        </>
                      ) : (
                        dash
                      )}
                    </td>
                    <td>
                      {profile?.marketCapitalization
                        ? formatMarketCapitalization(
                            profile.marketCapitalization,
                            profile.currency,
                            currency,
                            profile.marketCapitalizationMoney
                          )
                        : dash}
                    </td>
                    <td className="text-xs text-fg-muted">{formatFreshness(quote?.timestamp)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={stockPath(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50"
                          aria-label={`Open ${item.displaySymbol}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Button
                          type="button"
                          variant="icon"
                          size="sm"
                          aria-label={`Remove ${item.displaySymbol} from this watchlist`}
                          loading={removingId === item.id}
                          onClick={() => onRemove(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const snapshot = snapshotFor(item, snapshots);
          const quote = snapshot?.quote;
          const profile = snapshot?.profile;
          const sourceCurrency = quote?.sourceCurrency ?? profile?.currency ?? item.currency ?? '';
          const percent = quote?.percentChange;
          const up = (percent ?? 0) > 0;
          const down = (percent ?? 0) < 0;
          return (
            <article key={item.id} className="mm-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={stockPath(item)} className="font-medium text-fg hover:text-brand">
                    {item.displaySymbol}
                  </Link>
                  <p className="text-sm text-fg-muted">{item.companyName}</p>
                  <p className="text-xs text-fg-muted">
                    {[item.exchange || profile?.exchange, item.market].filter(Boolean).join(' · ') || dash}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="icon"
                  size="sm"
                  aria-label={`Remove ${item.displaySymbol} from this watchlist`}
                  loading={removingId === item.id}
                  onClick={() => onRemove(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-fg-muted">Price</dt>
                  <dd className="text-fg">
                    {quote
                      ? formatMonetaryValue(quote.currentPrice, sourceCurrency, currency, quote.monetary?.currentPrice)
                      : dash}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Day change</dt>
                  <dd className={up ? 'text-positive' : down ? 'text-negative' : 'text-fg'}>
                    {quote ? `${up ? '+' : ''}${(percent ?? 0).toFixed(2)}%` : dash}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Market cap</dt>
                  <dd className="text-fg">
                    {profile?.marketCapitalization
                      ? formatMarketCapitalization(
                          profile.marketCapitalization,
                          profile.currency,
                          currency,
                          profile.marketCapitalizationMoney
                        )
                      : dash}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Updated</dt>
                  <dd className="text-fg">{formatFreshness(quote?.timestamp)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default WatchlistItemsPanel;
