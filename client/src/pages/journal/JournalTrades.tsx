import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import DateTimePicker from '../../components/ui/DateTimePicker';
import { ASSET_CLASS_OPTIONS } from '../../config/journal';
import { fetchJournalTrades, getJournalErrorMessage } from '../../services/journal.service';
import { formatJournalAmount } from '../../utils/currency';

const selectClass =
  'rounded-lg border border-white/8 bg-ink-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/60';

const JournalTrades = () => {
  const [search, setSearch] = useState('');
  const [assetClass, setAssetClass] = useState('');
  const [status, setStatus] = useState('');
  const [direction, setDirection] = useState('');
  const [outcome, setOutcome] = useState('');
  const [strategy, setStrategy] = useState('');
  const [tags, setTags] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['journal-trades', { search, assetClass, status, direction, outcome, strategy, tags, from, to, page }],
    queryFn: () =>
      fetchJournalTrades({
        search: search || undefined,
        assetClass: assetClass || undefined,
        status: status || undefined,
        direction: direction || undefined,
        outcome: outcome || undefined,
        strategy: strategy || undefined,
        tags: tags || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 20,
        sort: 'entryDate',
        order: 'desc'
      }),
    retry: false
  });

  const rows = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trades"
        subtitle="Filter and review recorded journal entries."
        action={
          <Link to="/journal/trades/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 rounded-2xl border border-white/6 bg-ink-900/80 p-4 md:grid-cols-4">
        <Input
          placeholder="Search symbol or name"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select className={selectClass} value={assetClass} onChange={(event) => { setAssetClass(event.target.value); setPage(1); }}>
          <option value="">All assets</option>
          {ASSET_CLASS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select className={selectClass} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select className={selectClass} value={direction} onChange={(event) => { setDirection(event.target.value); setPage(1); }}>
          <option value="">All directions</option>
          <option value="LONG">Long</option>
          <option value="SHORT">Short</option>
        </select>
        <select className={selectClass} value={outcome} onChange={(event) => { setOutcome(event.target.value); setPage(1); }}>
          <option value="">All outcomes</option>
          <option value="profitable">Profitable</option>
          <option value="losing">Losing</option>
        </select>
        <Input placeholder="Strategy" value={strategy} onChange={(event) => { setStrategy(event.target.value); setPage(1); }} />
        <Input placeholder="Tags" value={tags} onChange={(event) => { setTags(event.target.value); setPage(1); }} />
        <DateTimePicker type="date" value={from} onChange={(value) => { setFrom(value); setPage(1); }} />
        <DateTimePicker type="date" value={to} onChange={(value) => { setTo(value); setPage(1); }} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/6 bg-ink-900/80 shadow-card">
        {query.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="p-5 text-sm text-amber-200">
            {getJournalErrorMessage(query.error, 'Unable to load trades.')}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No trades match these filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-white/6 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {['Instrument', 'Asset', 'Direction', 'Entry', 'Exit', 'P&L', 'Return', 'Entry date', 'Exit date', 'Strategy', 'Status'].map((label) => (
                    <th key={label} className="px-4 py-3 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link to={`/journal/trades/${trade.id}`} className="font-medium text-white hover:text-violet-200">
                        {trade.instrumentName}
                      </Link>
                      <div className="text-xs text-slate-500">{trade.displaySymbol}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">{trade.assetClass.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-300">{trade.direction}</td>
                    <td className="px-4 py-3 text-slate-300">{formatJournalAmount(trade.entryPrice, trade.currency)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatJournalAmount(trade.exitPrice, trade.currency)}</td>
                    <td className={`px-4 py-3 font-medium ${(trade.netPnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatJournalAmount(trade.netPnl, trade.currency)}
                    </td>
                    <td className={`px-4 py-3 ${(trade.returnPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.returnPercent === null ? '—' : `${trade.returnPercent.toFixed(2)}%`}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{trade.entryDate}</td>
                    <td className="px-4 py-3 text-slate-400">{trade.exitDate || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{trade.strategy || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{trade.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {query.data && query.data.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Page {query.data.page} of {query.data.totalPages} · {query.data.total} trades
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= query.data.totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JournalTrades;
