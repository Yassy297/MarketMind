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
        <h3 className="font-semibold text-white">Recently viewed</h3>
        <span className="text-xs uppercase tracking-wider text-slate-500">Your focus list</span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>
      ) : companies.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
          No recently viewed companies yet.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {companies.map((company) => (
            <li key={company.symbol}>
              <Link
                to={`/stocks?symbol=${encodeURIComponent(company.symbol)}&market=${company.market ?? ''}`}
                aria-label={`View ${company.name || company.symbol} stock details`}
                className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5 transition hover:border-violet-500/40 hover:bg-white/[0.04] focus-visible:border-violet-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-white">{company.symbol}</div>
                  <div className="truncate text-xs text-slate-500">{company.name}</div>
                </div>
                <div className="shrink-0 text-xs text-slate-500">{new Date(company.lastViewedAt).toLocaleDateString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default MarketSnapshot;
