import React from 'react';
import DashboardCard from './DashboardCard';
import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  accent?: 'default' | 'success' | 'warning' | 'accent';
  icon?: LucideIcon;
};

const accentClasses: Record<NonNullable<StatsCardProps['accent']>, string> = {
  default: 'bg-slate-500/15 text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-300',
  accent: 'bg-violet-500/15 text-violet-300'
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, loading = false, accent = 'default', icon: Icon }) => {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-slate-400">{title}</div>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-24 animate-pulse rounded bg-white/5" />
      ) : (
        <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div>
      )}
      {subtitle ? <div className="mt-2 text-sm text-slate-500">{subtitle}</div> : null}
    </DashboardCard>
  );
};

export default StatsCard;
