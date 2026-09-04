import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/button';
import { ASSET_CLASS_OPTIONS } from '../../config/journal';
import {
  deleteJournalTrade,
  duplicateJournalTrade,
  fetchJournalTrade,
  getJournalErrorMessage,
  invalidateJournalCaches
} from '../../services/journal.service';
import { formatJournalAmount } from '../../utils/currency';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-secondary">{title}</h2>
    {children}
  </section>
);

const Row = ({ label, value }: { label: string; value?: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-line-subtle py-2 last:border-0">
    <span className="text-sm text-fg-muted">{label}</span>
    <span className="text-right text-sm text-fg">{value ?? '—'}</span>
  </div>
);

const JournalTradeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['journal-trade', id],
    queryFn: () => fetchJournalTrade(id!),
    enabled: Boolean(id),
    retry: false
  });

  const invalidateJournal = () => {
    invalidateJournalCaches(queryClient, id);
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteJournalTrade(id!),
    onSuccess: () => {
      invalidateJournal();
      navigate('/journal/trades');
    },
    onError: (error) => setActionError(getJournalErrorMessage(error, 'Unable to delete the trade.'))
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateJournalTrade(id!),
    onSuccess: (trade) => {
      invalidateJournalCaches(queryClient, trade.id);
      navigate(`/journal/trades/${trade.id}`);
    },
    onError: (error) => setActionError(getJournalErrorMessage(error, 'Unable to duplicate the trade.'))
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-surface-hover" />
        <div className="h-48 animate-pulse rounded-2xl bg-surface-hover" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">
        {getJournalErrorMessage(query.error, 'Trade not found.')}
      </div>
    );
  }

  const trade = query.data;
  const assetLabel = ASSET_CLASS_OPTIONS.find((option) => option.value === trade.assetClass)?.label ?? trade.assetClass;
  const pnlClass = (trade.netPnl ?? 0) >= 0 ? 'text-positive' : 'text-negative';
  const details = trade.assetDetails ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={trade.instrumentName}
        subtitle={`${trade.displaySymbol} · ${assetLabel} · ${trade.currency}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to={`/journal/trades/${trade.id}/edit`}>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              disabled={duplicateMutation.isPending}
              onClick={() => duplicateMutation.mutate()}
            >
              <Copy className="h-4 w-4" />
              {duplicateMutation.isPending ? 'Duplicating…' : 'Duplicate'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-xs uppercase tracking-wider text-fg-muted">Direction</div>
          <div className="mt-1 text-lg font-semibold text-fg">{trade.direction}</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-xs uppercase tracking-wider text-fg-muted">Net P&L</div>
          <div className={`mt-1 text-lg font-semibold ${pnlClass}`}>
            {formatJournalAmount(trade.netPnl, trade.currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-xs uppercase tracking-wider text-fg-muted">Return</div>
          <div className={`mt-1 text-lg font-semibold ${pnlClass}`}>
            {trade.returnPercent === null ? '—' : `${trade.returnPercent.toFixed(2)}%`}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-xs uppercase tracking-wider text-fg-muted">Status</div>
          <div className="mt-1 text-lg font-semibold text-fg">{trade.status}</div>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning">{actionError}</div>
      ) : null}

      {confirmDelete ? (
        <div className="rounded-xl border border-negative/25 bg-negative/10 p-4">
          <p className="text-sm text-rose-100">Delete this journal entry? This cannot be undone.</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Confirm delete'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Trade summary">
          <Row label="Entry" value={formatJournalAmount(trade.entryPrice, trade.currency)} />
          <Row label="Exit" value={formatJournalAmount(trade.exitPrice, trade.currency)} />
          <Row label="Quantity" value={trade.quantity} />
          <Row label="Entry date" value={[trade.entryDate, trade.entryTime].filter(Boolean).join(' ')} />
          <Row label="Exit date" value={trade.exitDate ? [trade.exitDate, trade.exitTime].filter(Boolean).join(' ') : '—'} />
          <Row label="Fees" value={formatJournalAmount(trade.fees ?? 0, trade.currency)} />
          <Row label="Invested" value={formatJournalAmount(trade.investedAmount, trade.currency)} />
          <Row label="Exit value" value={formatJournalAmount(trade.exitValue, trade.currency)} />
          <Row label="Gross P&L" value={formatJournalAmount(trade.grossPnl, trade.currency)} />
          <Row label="Holding duration" value={trade.holdingDurationLabel ?? '—'} />
        </Section>

        <Section title="Risk">
          <Row label="Stop" value={formatJournalAmount(trade.stopLoss, trade.currency)} />
          <Row label="Target" value={formatJournalAmount(trade.target, trade.currency)} />
          <Row label="Risk" value={formatJournalAmount(trade.riskAmount, trade.currency)} />
          <Row label="Reward" value={formatJournalAmount(trade.rewardAmount, trade.currency)} />
          <Row label="R:R" value={trade.riskRewardRatio === null ? '—' : trade.riskRewardRatio.toFixed(2)} />
        </Section>

        <Section title="Strategy">
          <Row label="Strategy" value={trade.strategy} />
          <Row label="Setup" value={trade.setup} />
          <Row label="Market condition" value={trade.marketCondition} />
          <Row label="Market" value={trade.market} />
          <Row label="Exchange" value={trade.exchange ?? details.exchange} />
        </Section>

        <Section title="Psychology">
          <Row label="Confidence" value={trade.confidence ?? '—'} />
          <Row label="Trade quality" value={trade.tradeQuality ?? '—'} />
          <Row label="Emotion before" value={trade.emotionBefore} />
          <Row label="Emotion after" value={trade.emotionAfter} />
          <Row label="Followed plan" value={trade.followedPlan === null || trade.followedPlan === undefined ? '—' : trade.followedPlan ? 'Yes' : 'No'} />
        </Section>
      </div>

      <Section title="Journal">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Thesis', trade.thesis],
            ['Why I entered', trade.entryReason],
            ['Why I exited', trade.exitReason],
            ['Execution notes', trade.executionNotes],
            ['What went right', trade.whatWentRight],
            ['What went wrong', trade.whatWentWrong],
            ['Lesson learned', trade.lessonLearned],
            ['What I would do differently', trade.whatWouldDoDifferently],
            ['Notes', trade.notes]
          ].map(([label, value]) => (
            <div key={String(label)}>
              <div className="mb-1 text-xs uppercase tracking-wider text-fg-muted">{label}</div>
              <p className="whitespace-pre-wrap text-sm text-fg">{value || '—'}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Mistakes and tags">
        <div className="flex flex-wrap gap-2">
          {(trade.mistakeTags ?? []).length === 0 && (trade.tags ?? []).length === 0 ? (
            <span className="text-sm text-fg-muted">No tags recorded.</span>
          ) : null}
          {(trade.mistakeTags ?? []).map((tag) => (
            <span key={`m-${tag}`} className="rounded-full bg-negative/10 px-3 py-1 text-xs text-negative">{tag}</span>
          ))}
          {(trade.tags ?? []).map((tag) => (
            <span key={`t-${tag}`} className="rounded-full bg-surface-hover px-3 py-1 text-xs text-fg-secondary">{tag}</span>
          ))}
        </div>
      </Section>

      {Object.keys(details).length > 0 ? (
        <Section title="Asset details">
          {Object.entries(details)
            .filter(([, value]) => value !== undefined && value !== '')
            .map(([key, value]) => (
              <Row key={key} label={key.replace(/([A-Z])/g, ' $1')} value={String(value)} />
            ))}
        </Section>
      ) : null}

      <Section title="Attachments">
        {(trade.attachments ?? []).length === 0 ? (
          <p className="text-sm text-fg-muted">No attachment metadata stored for this entry.</p>
        ) : (
          <ul className="space-y-2 text-sm text-fg-secondary">
            {trade.attachments?.map((file) => (
              <li key={file.name}>{file.name}{file.mimeType ? ` · ${file.mimeType}` : ''}</li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
};

export default JournalTradeDetail;
