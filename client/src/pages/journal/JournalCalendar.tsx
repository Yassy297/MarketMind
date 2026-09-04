import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/button';
import { fetchJournalCalendar, fetchJournalCalendarDay, getJournalErrorMessage } from '../../services/journal.service';
import { formatJournalAmount } from '../../utils/currency';
import { formatMetricNumber, formatMetricPercent, metricTone } from '../../utils/journal-metrics';
import type { JournalCalendarDaySummary, JournalCalendarOutcome } from '../../types/journal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const outcomeClass: Record<JournalCalendarOutcome, string> = {
  PROFIT: 'bg-positive/10 text-positive ring-positive/25',
  LOSS: 'bg-negative/10 text-negative ring-negative/25',
  BREAKEVEN: 'bg-warning/10 text-warning ring-warning/25',
  NO_TRADES: 'bg-transparent text-fg-muted ring-border'
};

const outcomeLabel: Record<JournalCalendarOutcome, string> = {
  PROFIT: 'Profit',
  LOSS: 'Loss',
  BREAKEVEN: 'Breakeven',
  NO_TRADES: 'No trades'
};

const monthLabel = (year: number, month: number) =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });

const JournalCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthQuery = useQuery({
    queryKey: ['journal-calendar', year, month],
    queryFn: () => fetchJournalCalendar(year, month),
    retry: false
  });
  const dayQuery = useQuery({
    queryKey: ['journal-calendar', 'day', selectedDate],
    queryFn: () => fetchJournalCalendarDay(selectedDate!),
    enabled: Boolean(selectedDate),
    retry: false
  });

  const leadingBlanks = useMemo(
    () => new Date(Date.UTC(year, month - 1, 1)).getUTCDay(),
    [year, month]
  );

  const shiftMonth = (delta: number) => {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth() + 1);
    setSelectedDate(null);
  };

  const goCurrent = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDate(null);
  };

  const days = monthQuery.data?.days ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trade Calendar"
        subtitle="Daily journal activity for the selected month. Only that month is loaded."
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous month
            </Button>
            <Button size="sm" variant="secondary" onClick={goCurrent}>
              Current month
            </Button>
            <Button size="sm" variant="outline" onClick={() => shiftMonth(1)}>
              Next month
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-fg">{monthLabel(year, month)}</h2>
          {monthQuery.data ? (
            <p className="mt-1 text-sm text-fg-secondary">
              {monthQuery.data.monthTrades} trades · {monthQuery.data.monthWins} wins · {monthQuery.data.monthLosses} losses ·{' '}
              <span className={metricTone(monthQuery.data.monthNetPnl)}>
                {formatMetricNumber(monthQuery.data.monthNetPnl, { signed: true })}
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {(['PROFIT', 'LOSS', 'BREAKEVEN', 'NO_TRADES'] as JournalCalendarOutcome[]).map((outcome) => (
            <span key={outcome} className={`rounded-md px-2 py-1 ring-1 ring-inset ${outcomeClass[outcome]}`}>
              {outcomeLabel[outcome]}
            </span>
          ))}
        </div>
      </div>

      {monthQuery.isError ? (
        <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
          {getJournalErrorMessage(monthQuery.error, 'Unable to load the calendar.')}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="mm-card overflow-x-auto p-4">
          {monthQuery.isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-surface-hover" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((label) => (
                <div key={label} className="px-1 pb-1 text-center text-xs font-medium uppercase tracking-wider text-fg-muted">
                  {label}
                </div>
              ))}
              {Array.from({ length: leadingBlanks }).map((_, index) => (
                <div key={`blank-${index}`} />
              ))}
              {days.map((day) => (
                <CalendarCell
                  key={day.date}
                  day={day}
                  selected={selectedDate === day.date}
                  onSelect={() => setSelectedDate(day.date)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="mm-card">
          {!selectedDate ? (
            <p className="text-sm text-fg-muted">Select a day to review the trades recorded that day.</p>
          ) : dayQuery.isLoading ? (
            <div className="space-y-3">
              <div className="h-8 animate-pulse rounded-lg bg-surface-hover" />
              <div className="h-24 animate-pulse rounded-lg bg-surface-hover" />
            </div>
          ) : dayQuery.isError ? (
            <p className="text-sm text-warning">{getJournalErrorMessage(dayQuery.error, 'Unable to load that day.')}</p>
          ) : dayQuery.data ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-fg">{selectedDate}</h3>
                <p className="mt-1 text-sm text-fg-secondary">
                  {dayQuery.data.trades} trades · Win rate {formatMetricPercent(dayQuery.data.winRate)}
                </p>
                <p className={`mt-1 text-sm font-medium ${metricTone(dayQuery.data.netPnl)}`}>
                  Day P&L {formatMetricNumber(dayQuery.data.netPnl, { signed: true })}
                </p>
              </div>
              {dayQuery.data.items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-fg-muted">
                  No trades recorded on this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {dayQuery.data.items.map((trade) => (
                    <Link
                      key={trade.id}
                      to={`/journal/trades/${trade.id}`}
                      className="block rounded-xl border border-line px-3 py-3 hover:border-brand/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-fg">{trade.instrumentName}</div>
                          <div className="text-xs text-fg-muted">
                            {trade.displaySymbol} · {trade.direction} · {trade.status}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${metricTone(trade.netPnl)}`}>
                          {formatJournalAmount(trade.netPnl, trade.currency)}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-fg-secondary">
                        <span>Entry {trade.entryPrice}</span>
                        <span>Exit {trade.exitPrice ?? '—'}</span>
                        <span>Strategy {trade.strategy || '—'}</span>
                        <span>Setup {trade.setup || '—'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

const CalendarCell = ({
  day,
  selected,
  onSelect
}: {
  day: JournalCalendarDaySummary;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    aria-label={`${day.date}, ${outcomeLabel[day.outcome]}${day.trades ? `, ${day.trades} trades` : ''}`}
    className={`min-h-[5.5rem] min-w-[3.5rem] rounded-lg p-2 text-left ring-1 ring-inset transition hover:ring-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 ${
      outcomeClass[day.outcome]
    } ${selected ? 'ring-2 ring-brand' : ''}`}
  >
    <div className="flex items-center justify-between gap-1">
      <span className="text-xs font-medium text-fg">{Number(day.date.slice(8))}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide">{outcomeLabel[day.outcome]}</span>
    </div>
    {day.outcome === 'NO_TRADES' ? (
      <div className="mt-3 text-[11px] text-fg-muted">None</div>
    ) : (
      <>
        <div className="mt-2 text-sm font-semibold tabular-nums">{formatMetricNumber(day.netPnl, { signed: true })}</div>
        <div className="mt-1 text-[11px] opacity-80">
          {day.trades} · {day.wins}W / {day.losses}L
        </div>
      </>
    )}
  </button>
);

export default JournalCalendar;
