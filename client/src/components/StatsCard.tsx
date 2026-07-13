import React from 'react';
import DashboardCard from './DashboardCard';

type StatsCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  accent?: 'default' | 'success' | 'warning' | 'accent';
};

const accentClasses: Record<NonNullable<StatsCardProps['accent']>, string> = {
  default: 'border-gray-800',
  success: 'border-emerald-600/40 bg-emerald-950/25',
  warning: 'border-amber-600/40 bg-amber-950/25',
  accent: 'border-indigo-600/40 bg-indigo-950/25'
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, loading = false, accent = 'default' }) => {
  return (
    <DashboardCard>
      <div className={`rounded-lg border p-4 ${accentClasses[accent]}`}>
        <div className="text-sm text-gray-400">{title}</div>
        {loading ? (
          <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-700" />
        ) : (
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        )}
        {subtitle ? <div className="mt-2 text-sm text-gray-500">{subtitle}</div> : null}
      </div>
    </DashboardCard>
  );
};

export default StatsCard;
