import React, { useEffect, useState } from 'react';
import { Star, MoreHorizontal } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';

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
    <div className="space-y-6">
      <PageHeader
        title="My Watchlist"
        subtitle="Track your favorite stocks in one place."
        action={
          <Button size="sm">
            <Star className="h-4 w-4" />
            Add Stock
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/6 bg-ink-900/80 shadow-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Star className="h-8 w-8 text-slate-600" />
            <div className="text-sm font-medium text-slate-300">Your watchlist is empty</div>
            <p className="max-w-xs text-sm text-slate-500">Add companies from the Stocks page to start tracking them here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Change</th>
                <th className="px-5 py-3 font-medium">Market Cap</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.symbol} className="border-b border-white/4 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{item.symbol}</div>
                    {item.name && <div className="text-xs text-slate-500">{item.name}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">{item.price ? `$${item.price.toFixed(2)}` : '—'}</td>
                  <td className={`px-5 py-3.5 ${(item.percentChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.percentChange !== undefined ? `${item.percentChange.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">{item.marketCap ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
