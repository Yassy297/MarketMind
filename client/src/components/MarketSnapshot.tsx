import React from 'react';
import DashboardCard from './DashboardCard';

type CompanyItem = {
  symbol: string;
  name: string;
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
        <h3 className="font-semibold text-white">Recently viewed companies</h3>
        <span className="text-sm text-gray-500">Your focus list</span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-gray-800" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>
      ) : companies.length === 0 ? (
        <div className="mt-4 rounded border border-dashed border-gray-700 p-3 text-sm text-gray-500">
          No recently viewed companies.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {companies.map((company) => (
            <li key={company.symbol} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2">
              <div>
                <div className="font-medium text-white">{company.symbol}</div>
                <div className="text-sm text-gray-400">{company.name}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(company.lastViewedAt).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default MarketSnapshot;
