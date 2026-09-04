import React from 'react';
import DashboardCard from './DashboardCard';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MarketCode } from '../config/markets';

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
        <ul className="mt-4 space-y-2">
          {companies.map((company) => (
            <li key={company.symbol}>
              <Link
                to={`/stocks?symbol=${encodeURIComponent(company.symbol)}&market=${company.market ?? ''}`}
                aria-label={`View ${company.name || company.symbol} stock details`}
                className="flex items-center gap-3 rounded-xl border border-line bg-background-secondary px-3 py-2.5 transition hover:border-brand/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
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
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default MarketSnapshot;
