import React, { useEffect, useState } from 'react';
import { Star, MoreHorizontal } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/ui/EmptyState';

type WatchlistItem = {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  percentChange?: number;
  marketCap?: string;
};

const Watchlist: React.FC = () => {
  const [data, setData] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/watchlist')
      .then((r) => r.json())
      .then((j) => setData(j.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mm-page">
      <PageHeader
        title="Watchlist"
        subtitle="A foundation for tracking companies. Multiple watchlists will arrive in a later update."
      />

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No watchlists yet"
            description="You don’t have any saved lists. Multi-watchlist tracking will be added in a later phase. Stock research remains available on the Stocks page."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="mm-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Market cap</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const change = item.percentChange;
                  const up = (change ?? 0) > 0;
                  const down = (change ?? 0) < 0;
                  return (
                    <tr key={item.symbol}>
                      <td>
                        <div className="font-medium text-fg">{item.symbol}</div>
                        {item.name ? <div className="text-xs text-fg-muted">{item.name}</div> : null}
                      </td>
                      <td>{item.price ? `$${item.price.toFixed(2)}` : '—'}</td>
                      <td className={up ? 'text-positive' : down ? 'text-negative' : undefined}>
                        {change === undefined ? '—' : `${up ? '+' : ''}${change.toFixed(2)}%`}
                        {change !== undefined ? (
                          <span className="sr-only">{up ? ' up' : down ? ' down' : ' unchanged'}</span>
                        ) : null}
                      </td>
                      <td>{item.marketCap ?? '—'}</td>
                      <td className="text-right">
                        <button type="button" className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg" aria-label={`More actions for ${item.symbol}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
