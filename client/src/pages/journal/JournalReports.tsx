import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import JournalAnalyticsTable from '../../components/journal/JournalAnalyticsTable';
import JournalEmptyState from '../../components/journal/JournalEmptyState';
import { JournalBarChart, JournalLineChart } from '../../components/journal/JournalPnlChart';
import JournalReportFilters, {
  compactJournalFilters,
  emptyJournalFilters
} from '../../components/journal/JournalReportFilters';
import { ASSET_CLASS_OPTIONS } from '../../config/journal';
import { fetchJournalAnalytics, getJournalErrorMessage } from '../../services/journal.service';
import {
  formatMetricNumber,
  formatMetricPercent,
  formatMetricRatio,
  metricTone,
  weekdayOrder
} from '../../utils/journal-metrics';
import type {
  JournalAnalyticsFilters,
  JournalAnalyticsReport,
  JournalAnalyticsResponse,
  JournalGroupRow
} from '../../types/journal';

const REPORTS: Array<{ id: JournalAnalyticsReport; label: string }> = [
  { id: 'performance', label: 'Performance' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'setup', label: 'Setup' },
  { id: 'assetClass', label: 'Asset Class' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'time', label: 'Time' },
  { id: 'risk', label: 'Risk' }
];

const setupColumns = [
  { key: 'key' as const, label: 'Setup' },
  { key: 'trades' as const, label: 'Trades', numeric: true },
  { key: 'winRate' as const, label: 'Win rate', numeric: true },
  { key: 'netPnl' as const, label: 'Net P&L', numeric: true },
  { key: 'averagePnl' as const, label: 'Average P&L', numeric: true }
];

const assetLabel = (key: string) => ASSET_CLASS_OPTIONS.find((option) => option.value === key)?.label ?? key;

const planPrefix = (key: string) => {
  if (key === 'Followed plan') return 'Plan-followed trades had';
  if (key === 'Did not follow plan') return 'Plan-not-followed trades had';
  return `${key} trades had`;
};

const relationship = (prefix: string, row: JournalGroupRow) => {
  if (row.closedTrades === 0) {
    return `${prefix} ${row.trades} recorded trade${row.trades === 1 ? '' : 's'}. Closed-trade P&L is not available yet.`;
  }
  return `${prefix} ${row.trades} trade${row.trades === 1 ? '' : 's'}. Win rate ${formatMetricPercent(row.winRate)}. Net P&L ${formatMetricNumber(row.netPnl, { signed: true })}.`;
};

const monthlyPoints = (rows: Array<{ month: string; netPnl: number | null }>) =>
  rows.filter((point) => point.netPnl !== null).map((point) => ({ label: point.month, value: point.netPnl as number }));

const JournalReports = () => {
  const [report, setReport] = useState<JournalAnalyticsReport>('performance');
  const [filters, setFilters] = useState<JournalAnalyticsFilters>(emptyJournalFilters);
  const compact = compactJournalFilters(filters);
  const hasFilters = Object.values(compact).some(Boolean);

  const query = useQuery({
    queryKey: ['journal-analytics', report, compact],
    queryFn: () => fetchJournalAnalytics(report, compact),
    retry: false
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Reports"
        subtitle="Server-side analytics from your recorded trades. Relationships are observational, not causal."
      />

      <div className="flex flex-wrap gap-2">
        {REPORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setReport(item.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              report === item.id
                ? 'bg-brand-subtle text-brand ring-1 ring-inset ring-brand/30'
                : 'text-fg-secondary hover:bg-surface-hover hover:text-fg'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <JournalReportFilters value={filters} onChange={setFilters} />

      {query.isError ? (
        <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
          {getJournalErrorMessage(query.error, 'Unable to load this report.')}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {query.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : query.data ? (
          <ReportBody data={query.data} hasFilters={hasFilters} />
        ) : (
          <div className="p-10 text-center text-sm text-fg-muted">No report data.</div>
        )}
      </section>
    </div>
  );
};

const ReportBody = ({ data, hasFilters }: { data: JournalAnalyticsResponse; hasFilters: boolean }) => {
  if (data.empty) {
    if (hasFilters) {
      return (
        <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-fg-muted">
          No trades match these filters.
        </div>
      );
    }
    return (
      <div className="p-6">
        <JournalEmptyState
          title="You haven't recorded any trades yet."
          description="Reports stay empty until you add journal entries."
        />
      </div>
    );
  }

  if (data.report === 'performance') return <PerformanceReport data={data} />;
  if (data.report === 'strategy') return <JournalAnalyticsTable rows={data.rows} nameLabel="Strategy" />;
  if (data.report === 'setup') return <JournalAnalyticsTable rows={data.rows} columns={setupColumns} nameLabel="Setup" />;
  if (data.report === 'assetClass') {
    return (
      <JournalAnalyticsTable
        rows={data.rows.map((row) => ({ ...row, key: assetLabel(row.key) }))}
        columns={setupColumns}
        nameLabel="Asset class"
      />
    );
  }
  if (data.report === 'psychology') return <PsychologyReport data={data} />;
  if (data.report === 'time') return <TimeReport data={data} />;
  if (data.report === 'risk') return <RiskReport data={data} />;
  return <div className="p-10 text-center text-sm text-fg-muted">No report data.</div>;
};

const PerformanceReport = ({
  data
}: {
  data: Extract<JournalAnalyticsResponse, { report: 'performance' }>;
}) => (
  <div className="space-y-5 p-5">
    {data.summary.sampleNote ? (
      <p className="rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-xs text-warning">
        {data.summary.sampleNote}
      </p>
    ) : null}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard title="Win rate" value={formatMetricPercent(data.summary.winRate)} />
      <StatsCard title="Net P&L" value={<span className={metricTone(data.summary.netPnl)}>{formatMetricNumber(data.summary.netPnl, { signed: true })}</span>} />
      <StatsCard title="Profit factor" value={formatMetricRatio(data.summary.profitFactor)} subtitle="Requires losses" />
      <StatsCard title="Expectancy" value={formatMetricNumber(data.summary.expectancy, { signed: true })} subtitle="Requires decided trades" />
      <StatsCard title="Average win" value={formatMetricNumber(data.summary.averageWin, { signed: true })} />
      <StatsCard title="Average loss" value={formatMetricNumber(data.summary.averageLoss, { signed: true })} />
      <StatsCard title="Average return" value={formatMetricPercent(data.summary.averageReturn)} />
      <StatsCard
        title="Streaks"
        value={`${data.streaks.currentWinStreak}W / ${data.streaks.currentLossStreak}L`}
        subtitle={`Longest ${data.streaks.longestWinStreak}W / ${data.streaks.longestLossStreak}L`}
      />
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <JournalBarChart title="P&L over time" points={data.pnlOverTime.map((point) => ({ label: point.date.slice(5), value: point.pnl }))} />
      <JournalLineChart title="Cumulative P&L" points={data.pnlOverTime.map((point) => ({ label: point.date.slice(5), value: point.cumulative }))} />
    </div>
    <JournalBarChart title="Monthly performance" points={monthlyPoints(data.monthly)} />
  </div>
);

const PsychologyReport = ({
  data
}: {
  data: Extract<JournalAnalyticsResponse, { report: 'psychology' }>;
}) => (
  <div className="space-y-6 p-5">
    <p className="text-sm text-fg-secondary">
      These figures describe trades that carried a tag or field. They do not mean a feeling or mistake caused the result.
    </p>
    <PsychologyBlock title="Mistake tags" rows={data.mistakes} prefix={(key) => `Trades tagged ${key.replace(/^Tagged /, '')} had`} />
    <PsychologyBlock title="Emotion before the trade" rows={data.emotions} prefix={(key) => `Trades tagged ${key} had`} />
    <PsychologyBlock title="Plan adherence" rows={data.plan} prefix={planPrefix} />
    <PsychologyBlock title="Confidence" rows={data.confidence} prefix={(key) => `${key} trades had`} />
  </div>
);

const TimeReport = ({
  data
}: {
  data: Extract<JournalAnalyticsResponse, { report: 'time' }>;
}) => (
  <div className="space-y-6 p-5">
    <div>
      <h3 className="mb-3 font-semibold text-fg">Performance by weekday</h3>
      <JournalAnalyticsTable
        rows={[...data.weekday].sort((left, right) => weekdayOrder.indexOf(left.key) - weekdayOrder.indexOf(right.key))}
        columns={setupColumns}
        nameLabel="Weekday"
      />
    </div>
    <JournalBarChart title="Performance by month" points={monthlyPoints(data.month)} />
    <div>
      <h3 className="mb-3 font-semibold text-fg">Performance by holding duration</h3>
      <JournalAnalyticsTable
        rows={data.duration}
        columns={setupColumns}
        nameLabel="Duration"
        emptyLabel="Closed trades with timestamps will appear here."
      />
    </div>
    {data.byHour ? (
      <div>
        <h3 className="mb-3 font-semibold text-fg">Performance by entry hour</h3>
        <JournalAnalyticsTable rows={data.byHour} columns={setupColumns} nameLabel="Entry hour" />
      </div>
    ) : (
      <p className="rounded-lg border border-line px-4 py-3 text-sm text-fg-muted">
        Entry-hour performance is hidden until at least five trades include an entry time.
      </p>
    )}
  </div>
);

const RiskReport = ({
  data
}: {
  data: Extract<JournalAnalyticsResponse, { report: 'risk' }>;
}) => (
  <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
    <StatsCard title="Average planned R:R" value={formatMetricRatio(data.averagePlannedRr)} subtitle="Only trades with a stored ratio" />
    <StatsCard title="Average realized return" value={formatMetricPercent(data.averageRealizedReturn)} subtitle="Closed trades with return %" />
    <StatsCard title="Trades with stop loss" value={data.tradesWithStopLoss} subtitle={`${data.missingStopLoss} missing`} />
    <StatsCard title="Trades with target" value={data.tradesWithTarget} subtitle={`${data.missingTarget} missing`} />
    <StatsCard title="Plan followed" value={data.planFollowed} subtitle="Recorded as followed" />
    <StatsCard title="Plan not followed" value={data.planNotFollowed} subtitle="Recorded as not followed" />
    <StatsCard title="Plan unspecified" value={data.planUnspecified} subtitle="No adherence recorded" />
    <StatsCard title="Closed net P&L" value={<span className={metricTone(data.summary.netPnl)}>{formatMetricNumber(data.summary.netPnl, { signed: true })}</span>} />
  </div>
);

const PsychologyBlock = ({
  title,
  rows,
  prefix
}: {
  title: string;
  rows: JournalGroupRow[];
  prefix: (key: string) => string;
}) => {
  const specified = rows.filter((row) => row.key !== 'Unspecified' && !row.key.includes('Unspecified'));
  if (specified.length === 0) {
    return (
      <div>
        <h3 className="mb-2 font-semibold text-fg">{title}</h3>
        <p className="text-sm text-fg-muted">No recorded values in this category yet.</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-3 font-semibold text-fg">{title}</h3>
      <div className="space-y-2">
        {specified.map((row) => (
          <div key={row.key} className="rounded-xl border border-line px-4 py-3 text-sm text-fg-secondary">
            {relationship(prefix(row.key), row)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalReports;
