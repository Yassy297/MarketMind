import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import MarketSnapshot from '../components/MarketSnapshot';
import { fetchDashboardSummary } from '../services/dashboard.service';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
    retry: false
  });

  const errorMessage = error instanceof Error ? error.message : 'Unable to load dashboard.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back, {user?.name ?? 'there'}.</h1>
          <div className="text-sm text-gray-400">Here is a live snapshot of your research workspace.</div>
        </div>
        <div className="text-sm text-gray-500">Your dashboard is synced with your account</div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard title="Documents" value={data?.documentsCount ?? 0} subtitle="Saved research files" loading={isLoading} accent="accent" />
        <StatsCard title="Watchlist" value={data?.watchlistCount ?? 0} subtitle="Tracked companies" loading={isLoading} accent="success" />
        <StatsCard title="Conversations" value={data?.conversationsCount ?? 0} subtitle="AI chat threads" loading={isLoading} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <RecentActivity items={data?.recentActivity ?? []} loading={isLoading} error={isError ? errorMessage : null} />
        <MarketSnapshot companies={data?.recentlyViewedCompanies ?? []} loading={isLoading} error={isError ? errorMessage : null} />
      </div>
    </div>
  );
};

export default Dashboard;
