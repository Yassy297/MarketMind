import type { CorporateActionsResearch } from '../../types/market-data';
import { formatConvertedMonetaryValue } from '../../utils/currency';
import ResearchSection from './ResearchSection';

type CorporateActionsProps = {
  data?: CorporateActionsResearch;
  loading: boolean;
  error?: string | null;
};

const CorporateActions = ({ data, loading, error }: CorporateActionsProps) => (
  <ResearchSection
    title="Corporate actions"
    subtitle="Dividends, bonus issues, splits, and rights events reported by the provider."
    loading={loading}
    error={error}
    availability={data?.availability}
  >
    {(data?.actions ?? []).length === 0 ? (
      <div className="rounded-lg border border-dashed border-line p-4 text-sm text-fg-muted">
        No corporate actions available.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-fg-muted">
            <tr>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Ratio</th>
              <th className="pb-3 font-medium">Effective date</th>
              <th className="pb-3 font-medium">Announcement</th>
              <th className="pb-3 font-medium">Record date</th>
              <th className="pb-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {(data?.actions ?? []).map((action, index) => (
              <tr key={`${action.type}-${action.effectiveAt ?? index}`}>
                <td className="py-3 font-medium text-fg">{action.type}</td>
                <td className="py-3 text-fg-secondary">
                  {action.amount ? formatConvertedMonetaryValue(action.amount) : '—'}
                </td>
                <td className="py-3 text-fg-secondary">{action.ratio || '—'}</td>
                <td className="py-3 text-fg-secondary">{action.effectiveAt || '—'}</td>
                <td className="py-3 text-fg-secondary">{action.announcedAt || '—'}</td>
                <td className="py-3 text-fg-secondary">{action.recordDate || '—'}</td>
                <td className="max-w-xs py-3 text-fg-muted">{action.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </ResearchSection>
);

export default CorporateActions;
