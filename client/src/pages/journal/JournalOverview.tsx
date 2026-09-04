import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import JournalEmptyState from '../../components/journal/JournalEmptyState';
import { JournalBarChart, JournalLineChart } from '../../components/journal/JournalPnlChart';
import Button from '../../components/ui/button';
import { fetchJournalOverview, fetchJournalTrades, getJournalErrorMessage } from '../../services/journal.service';
import { formatJournalAmount } from '../../utils/currency';
import { formatMetricNumber, formatMetricPercent, formatMetricRatio, metricTone } from '../../utils/journal-metrics';

const PerformanceMetric = ({
  label,
  value,
  note,
  tone
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
}) => (
  <div className="rounded-xl border border-line bg-background/50 p-4">
    <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
    <div className={`mt-2 text-lg font-semibold ${tone ?? 'text-fg'}`}>{value}</div>
    {note ? <div className="mt-1 text-xs text-fg-muted">{note}</div> : null}
  </div>
);

const JournalOverview = () => {
  const overviewQuery = useQuery({
    queryKey: ['journal-overview'],
    queryFn: () => fetchJournalOverview(),
    retry: false
  });
  const recentQuery = useQuery({
    queryKey: ['journal-trades', { page: 1, limit: 5, sort: 'entryDate' }],
    queryFn: () => fetchJournalTrades({ page: 1, limit: 5, sort: 'entryDate', order: 'desc' }),
    retry: false
  });

  const overview = overviewQuery.data;
  const performance = overview?.performance;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trade Journal"
        subtitle="Record completed trades and review them later. MarketMind does not place orders."
        action={
          <Link to="/journal/trades/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </Link>
        }
      />

      {overviewQuery.isError ? (
        <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
          {getJournalErrorMessage(overviewQuery.error, 'Unable to load journal overview.')}
        </div>
      ) : null}

      {overviewQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <StatsCard key={index} title="Loading" value="" loading />
          ))}
        </div>
      ) : null}
      {!overviewQuery.isLoading && overview?.empty ? <JournalEmptyState /> : null}
      {!overviewQuery.isLoading && overview && !overview.empty ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard title="Total Trades" value={overview.totalTrades} subtitle={`${overview.openTrades} still open`} icon={BookOpen} />
            <StatsCard title="Winning Trades" value={overview.winningTrades} subtitle="Closed trades with profit" accent="success" />
            <StatsCard title="Losing Trades" value={overview.losingTrades} subtitle="Closed trades with a loss" accent="warning" />
            <StatsCard title="Win Rate" value={formatMetricPercent(overview.winRate)} subtitle="Wins ÷ (wins + losses)" />
            <StatsCard
              title="Total Net P&L"
              value={<span className={metricTone(overview.netPnl)}>{formatMetricNumber(overview.netPnl, { signed: true })}</span>}
              subtitle="Closed trades, stored amounts"
            />
            <StatsCard title="Average Trade" value={formatMetricNumber(overview.averageTrade, { signed: true })} subtitle="Mean closed-trade net P&L" />
            <StatsCard
              title="Best Trade"
              value={<span className={metricTone(overview.bestTrade)}>{formatMetricNumber(overview.bestTrade, { signed: true })}</span>}
              subtitle="Highest closed net P&L"
            />
            <StatsCard
              title="Worst Trade"
              value={<span className={metricTone(overview.worstTrade)}>{formatMetricNumber(overview.worstTrade, { signed: true })}</span>}
              subtitle="Lowest closed net P&L"
            />
          </div>

          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-semibold text-fg">Performance</h2>
            {performance?.sampleNote ? (
              <p className="mb-4 rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-xs text-warning">
                {performance.sampleNote}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PerformanceMetric label="Average win" value={formatMetricNumber(performance?.averageWin, { signed: true })} note="Needs at least one winning trade" tone={metricTone(performance?.averageWin)} />
              <PerformanceMetric label="Average loss" value={formatMetricNumber(performance?.averageLoss, { signed: true })} note="Needs at least one losing trade" tone={metricTone(performance?.averageLoss)} />
              <PerformanceMetric label="Profit factor" value={formatMetricRatio(performance?.profitFactor)} note="Gross wins ÷ gross losses. Shown only when losses exist." />
              <PerformanceMetric label="Expectancy" value={formatMetricNumber(performance?.expectancy, { signed: true })} note="Needs decided wins or losses" />
              <PerformanceMetric label="Average return" value={formatMetricPercent(performance?.averageReturn)} note="Mean return % on closed trades" />
              <PerformanceMetric label="Winning vs losing" value={`${overview.winningTrades} / ${overview.losingTrades}`} note={`${overview.breakevenTrades} breakeven`} />
              <PerformanceMetric label="Current win streak" value={String(overview.streaks.currentWinStreak)} note={`Longest ${overview.streaks.longestWinStreak}`} />
              <PerformanceMetric label="Current loss streak" value={String(overview.streaks.currentLossStreak)} note={`Longest ${overview.streaks.longestLossStreak}`} />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <JournalBarChart
              title="P&L over time"
              points={overview.pnlOverTime.map((point) => ({ label: point.date.slice(5), value: point.pnl }))}
            />
            <JournalLineChart
              title="Cumulative P&L"
              points={overview.pnlOverTime.map((point) => ({ label: point.date.slice(5), value: point.cumulative }))}
            />
          </div>
          <JournalBarChart
            title="Monthly performance"
            points={overview.monthly
              .filter((point) => point.netPnl !== null)
              .map((point) => ({ label: point.month, value: point.netPnl as number }))}
          />
        </>
      ) : null}

      {overview && !overview.empty ? (
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-fg">Recent trades</h2>
          <Link to="/journal/trades" className="text-sm text-brand hover:text-brand">
            View all
          </Link>
        </div>
        {recentQuery.isLoading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
            <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
          </div>
        ) : (recentQuery.data?.items.length ?? 0) === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-fg-muted">
            No trades recorded yet. Add a trade you have already taken.
          </div>
        ) : (
          <div className="space-y-2">
            {recentQuery.data?.items.map((trade) => (
              <Link
                key={trade.id}
                to={`/journal/trades/${trade.id}`}
                className="flex items-center justify-between rounded-xl border border-line px-4 py-3 hover:border-brand/30"
              >
                <div>
                  <div className="font-medium text-fg">{trade.instrumentName}</div>
                  <div className="text-xs text-fg-muted">
                    {trade.displaySymbol} · {trade.direction} · {trade.status}
                  </div>
                </div>
                <div className={`text-sm font-medium ${metricTone(trade.netPnl)}`}>
                  {formatJournalAmount(trade.netPnl, trade.currency)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      ) : null}
    </div>
  );
};

export default JournalOverview;
