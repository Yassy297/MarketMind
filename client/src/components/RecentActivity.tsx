import React from 'react';
import DashboardCard from './DashboardCard';
import { Activity } from 'lucide-react';

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
        <h3 className="text-card-title text-fg">Recent activity</h3>
        <span className="text-xs uppercase tracking-wider text-fg-muted">Latest updates</span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-surface-hover" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-lg border border-negative/25 bg-negative/10 p-3 text-sm text-negative">{error}</div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line p-6 text-center">
          <p className="text-sm font-medium text-fg">No recent activity yet</p>
          <p className="mt-1 text-sm text-fg-muted">Research views and journal updates will appear here.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface-hover p-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-fg">{item.title}</div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">{item.type}</span>
                </div>
                <div className="mt-1 text-sm text-fg-secondary">{item.description}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default RecentActivity;
