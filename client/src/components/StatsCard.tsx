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
  default: 'bg-background-secondary text-fg-secondary',
  success: 'bg-positive/12 text-positive',
  warning: 'bg-warning/12 text-warning',
  accent: 'bg-brand-subtle text-brand'
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  loading = false,
  accent = 'default',
  icon: Icon
}) => (
  <DashboardCard>
    <div className="flex items-start justify-between gap-3">
      <div className="text-sm font-medium text-fg-secondary">{title}</div>
      {Icon ? (
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
    </div>
    {loading ? (
      <div className="mt-4 h-8 w-24 animate-pulse rounded bg-surface-hover" />
    ) : (
      <div className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-[1.7rem]">{value}</div>
    )}
    {subtitle ? <div className="mt-2 text-sm text-fg-muted">{subtitle}</div> : null}
  </DashboardCard>
);

export default StatsCard;
