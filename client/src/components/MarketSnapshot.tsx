import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardCard from './DashboardCard';
import { Building2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MarketCode } from '../config/markets';
import {
  deleteRecentlyViewed,
  getStockErrorMessage,
  invalidateRecentlyViewedQueries
} from '../services/stock.service';

type CompanyItem = {
  symbol: string;
  name: string;
  market?: MarketCode;
  lastViewedAt: string;
};

type MarketSnapshotProps = {
  companies: CompanyItem[];
  loading?: boolean;
  error?: string | null;
};

const MarketSnapshot: React.FC<MarketSnapshotProps> = ({ companies, loading = false, error }) => {
  const queryClient = useQueryClient();
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: deleteRecentlyViewed,
    onMutate: (symbol) => {
      setRemovingSymbol(symbol);
      setDeleteError(null);
    },
    onSuccess: () => invalidateRecentlyViewedQueries(queryClient),
    onError: (mutationError) => {
      setDeleteError(getStockErrorMessage(mutationError, 'Unable to remove recently viewed stock.'));
    },
    onSettled: () => setRemovingSymbol(null)
  });

  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <h3 className="text-card-title text-fg">Recently viewed</h3>
        <span className="text-xs uppercase tracking-wider text-fg-muted">Your focus list</span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-lg border border-negative/25 bg-negative/10 p-3 text-sm text-negative">{error}</div>
      ) : companies.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line p-6 text-center">
          <p className="text-sm font-medium text-fg">No recently viewed stocks</p>
          <p className="mt-1 text-sm text-fg-muted">Open a company on the Stocks page to start this list.</p>
        </div>
      ) : (
        <>
          {deleteError ? (
            <div className="mt-4 rounded-lg border border-negative/25 bg-negative/10 p-3 text-sm text-negative" role="alert">
              {deleteError}
            </div>
          ) : null}
          <ul className="mt-4 space-y-2">
          {companies.map((company) => (
            <li key={company.symbol}>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-background-secondary px-3 py-2.5 transition hover:border-brand/40 hover:bg-surface-hover">
                <Link
                  to={`/stocks?symbol=${encodeURIComponent(company.symbol)}&market=${company.market ?? ''}`}
                  aria-label={`View ${company.name || company.symbol} stock details`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-fg">{company.symbol}</div>
                    <div className="truncate text-xs text-fg-muted">{company.name}</div>
                  </div>
                  <div className="shrink-0 text-xs text-fg-muted">{new Date(company.lastViewedAt).toLocaleDateString()}</div>
                </Link>
                <button
                  type="button"
                  aria-label={`Remove ${company.symbol} from recently viewed`}
                  title={`Remove ${company.symbol} from recently viewed`}
                  disabled={removingSymbol === company.symbol}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    deleteMutation.mutate(company.symbol);
                  }}
                  className="rounded-lg p-2 text-negative transition hover:bg-negative/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-negative/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className={`h-4 w-4 ${removingSymbol === company.symbol ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </li>
          ))}
          </ul>
        </>
      )}
    </DashboardCard>
  );
};

export default MarketSnapshot;
