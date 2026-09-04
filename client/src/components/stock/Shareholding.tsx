import type { ShareholdingResearch } from '../../types/market-data';
import ResearchSection from './ResearchSection';

type ShareholdingProps = {
  data?: ShareholdingResearch;
  loading: boolean;
  error?: string | null;
};

const Shareholding = ({ data, loading, error }: ShareholdingProps) => {
  const periods = [
    ...new Set(data?.categories.flatMap((category) => category.history.map((point) => point.period)) ?? [])
  ];

  return (
    <ResearchSection
      title="Shareholding"
      subtitle="Quarterly ownership distribution and historical trend."
      loading={loading}
      error={error}
      availability={data?.availability}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {(data?.categories ?? []).map((category) => {
          const current = category.history[0];
          const previous = category.history[1];
          const change =
            current && previous ? current.value - previous.value : null;
          return (
            <div key={category.key} className="rounded-xl border border-line bg-surface-hover p-3">
              <div className="text-xs uppercase tracking-wider text-fg-muted">{category.label}</div>
              <div className="mt-1 text-lg font-semibold text-fg">
                {current ? `${current.value.toFixed(2)}%` : 'Not available'}
              </div>
              <div className="mt-1 text-xs text-fg-muted">
                {current?.period}
                {change !== null
                  ? ` · ${change >= 0 ? '+' : ''}${change.toFixed(2)} pp`
                  : ''}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${Math.max(0, Math.min(100, current?.value ?? 0))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {periods.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="pb-3 font-medium">Holder category</th>
                {periods.map((period) => (
                  <th key={period} className="pb-3 font-medium">{period}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {(data?.categories ?? []).map((category) => (
                <tr key={category.key}>
                  <td className="py-3 font-medium text-fg-secondary">{category.label}</td>
                  {periods.map((period) => (
                    <td key={period} className="py-3 text-fg">
                      {category.history.find((point) => point.period === period)?.value.toFixed(2) ?? '—'}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </ResearchSection>
  );
};

export default Shareholding;
