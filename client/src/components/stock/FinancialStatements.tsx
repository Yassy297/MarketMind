import type {
  FinancialStatementData,
  FinancialStatementsResearch,
  ReportingPeriod,
  StatementSeries,
  StatementType
} from '../../types/market-data';
import { formatConvertedMonetaryValue } from '../../utils/currency';
import ResearchSection from './ResearchSection';

type FinancialStatementsProps = {
  data?: FinancialStatementsResearch;
  loading: boolean;
  error?: string | null;
  statementType: StatementType;
  reportingPeriod: ReportingPeriod;
  onStatementTypeChange: (value: StatementType) => void;
  onReportingPeriodChange: (value: ReportingPeriod) => void;
};

const amountText = (series: StatementSeries, index: number) =>
  formatConvertedMonetaryValue(
    series.history[index]?.amount,
    series.unit === 'crore' ? ' Cr' : ''
  );

const changeText = (series: StatementSeries) => {
  const point = series.history[0];
  if (point?.changePercentage === null || point?.changePercentage === undefined) return '—';
  return `${point.changePercentage >= 0 ? '+' : ''}${point.changePercentage.toFixed(1)}%${
    point.changeSource === 'derived' ? ' (derived)' : ''
  }`;
};

const StatementTable = ({ statement }: { statement: FinancialStatementData }) => {
  const periods = statement.details[0]?.history.map((point) => point.period).slice(0, 4) ?? [];
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/8 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="pb-3 font-medium">Metric</th>
              <th className="pb-3 font-medium">Current period</th>
              <th className="pb-3 font-medium">Previous period</th>
              <th className="pb-3 font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {statement.summary.map((series) => (
              <tr key={series.key}>
                <td className="py-3 font-medium text-slate-200">
                  {series.label}
                  {series.source === 'derived' ? (
                    <div className="mt-0.5 text-[11px] font-normal text-slate-500">Derived</div>
                  ) : null}
                </td>
                <td className="py-3 text-white">
                  {amountText(series, 0)}
                  <span className="ml-2 text-xs text-slate-500">{series.history[0]?.period}</span>
                </td>
                <td className="py-3 text-slate-300">
                  {amountText(series, 1)}
                  <span className="ml-2 text-xs text-slate-500">{series.history[1]?.period}</span>
                </td>
                <td className="py-3 text-slate-400">{changeText(series)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statement.details.length ? (
        <details className="mt-4 rounded-xl border border-white/6 bg-white/[0.02]">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-300">
            Inspect detailed line items
          </summary>
          <div className="overflow-x-auto border-t border-white/6 p-4">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Line item</th>
                  {periods.map((period) => (
                    <th key={period} className="pb-3 font-medium">{period}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {statement.details.map((series) => (
                  <tr key={series.key}>
                    <td className="py-2.5 pr-4 text-slate-300">{series.label}</td>
                    {periods.map((period) => {
                      const point = series.history.find((item) => item.period === period);
                      return (
                        <td key={period} className="py-2.5 pr-4 text-white">
                          {formatConvertedMonetaryValue(
                            point?.amount,
                            series.unit === 'crore' ? ' Cr' : ''
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </>
  );
};

const FinancialStatements = ({
  data,
  loading,
  error,
  statementType,
  reportingPeriod,
  onStatementTypeChange,
  onReportingPeriodChange
}: FinancialStatementsProps) => {
  const controls = (
    <div className="flex flex-wrap gap-2">
      <label className="text-xs text-slate-500">
        <span className="sr-only">Reporting period</span>
        <select
          value={reportingPeriod}
          onChange={(event) => onReportingPeriodChange(event.target.value as ReportingPeriod)}
          className="rounded-lg border border-white/8 bg-ink-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/60"
        >
          <option value="yearly">Annual</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </label>
      <label className="text-xs text-slate-500">
        <span className="sr-only">Statement scope</span>
        <select
          value={statementType}
          onChange={(event) => onStatementTypeChange(event.target.value as StatementType)}
          className="rounded-lg border border-white/8 bg-ink-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/60"
        >
          <option value="consolidated">Consolidated</option>
          <option value="standalone">Standalone</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      <ResearchSection
        title="Financial performance"
        subtitle="Revenue and profit history. Detailed line items are annual when supplied by the provider."
        action={controls}
        loading={loading}
        error={error}
        availability={data?.incomeStatement.availability}
      >
        {data ? <StatementTable statement={data.incomeStatement} /> : null}
      </ResearchSection>

      <ResearchSection
        title="Balance sheet"
        subtitle="Provider-reported annual assets and liabilities; percentage changes are marked as derived."
        loading={loading}
        error={error}
        availability={data?.balanceSheet.availability}
      >
        {data ? <StatementTable statement={data.balanceSheet} /> : null}
      </ResearchSection>

      <ResearchSection
        title="Cash flow"
        subtitle="Annual operating, investing, and financing cash flows."
        loading={loading}
        error={error}
        availability={data?.cashFlow.availability}
      >
        {data ? <StatementTable statement={data.cashFlow} /> : null}
      </ResearchSection>
    </div>
  );
};

export default FinancialStatements;
