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
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Good to see you, {user?.name ?? 'there'} 👋</h1>
          <p className="mt-1 text-sm text-slate-400">Here's what's happening in your research workspace.</p>
        </div>
        <div className="rounded-lg border border-white/8 bg-ink-900/60 px-3 py-1.5 text-sm text-slate-400">{today}</div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{errorMessage}</div>
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
