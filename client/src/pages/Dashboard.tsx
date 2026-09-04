import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import MarketSnapshot from '../components/MarketSnapshot';
import { fetchDashboardSummary } from '../services/dashboard.service';
import { useMarketContext } from '../context/MarketContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { market, currency } = useMarketContext();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-summary', market, currency],
    queryFn: () => fetchDashboardSummary({ market, currency }),
    retry: false
  });

  const errorMessage = error instanceof Error ? error.message : 'Unable to load dashboard.';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="mm-page">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-page-title text-fg">Good to see you, {user?.name ?? 'there'}</h1>
          <p className="text-sm text-fg-secondary">Here's what's happening in your research workspace.</p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg-secondary">{today}</div>
      </div>

      {isError ? (
        <div className="mm-alert-error" role="alert">{errorMessage}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Documents" value={data?.documentsCount ?? 0} subtitle="Saved research files" loading={isLoading} accent="accent" icon={FileText} />
        <StatsCard title="Watchlist" value={data?.watchlistCount ?? 0} subtitle="Tracked companies" loading={isLoading} accent="success" icon={Star} />
        <StatsCard title="Conversations" value={data?.conversationsCount ?? 0} subtitle="AI chat threads" loading={isLoading} accent="warning" icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <RecentActivity items={data?.recentActivity ?? []} loading={isLoading} error={isError ? errorMessage : null} />
        <MarketSnapshot companies={data?.recentlyViewedCompanies ?? []} loading={isLoading} error={isError ? errorMessage : null} />
      </div>
    </div>
  );
};

export default Dashboard;
