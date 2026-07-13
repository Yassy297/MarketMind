import React from 'react';
import DashboardCard from './DashboardCard';

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
};

type RecentActivityProps = {
  items: ActivityItem[];
  loading?: boolean;
  error?: string | null;
};

const RecentActivity: React.FC<RecentActivityProps> = ({ items, loading = false, error }) => {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Recent activity</h3>
        <span className="text-sm text-gray-500">Latest updates</span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded bg-gray-800" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded border border-dashed border-gray-700 p-3 text-sm text-gray-500">
          No recent activity yet.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="mt-1 text-sm text-gray-400">{item.description}</div>
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-500">{item.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default RecentActivity;
