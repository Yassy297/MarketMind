import type { FundamentalsOverview as FundamentalsData, PriceData } from '../../types/market-data';
import { formatConvertedMonetaryValue, formatMonetaryValue } from '../../utils/currency';
import type { CurrencyCode } from '../../config/markets';
import ResearchSection from './ResearchSection';

type FundamentalsOverviewProps = {
  data?: FundamentalsData;
  quote?: PriceData;
  displayCurrency: CurrencyCode | null;
  loading: boolean;
  error?: string | null;
};

const ratioText = (value: number | null | undefined, percentage = false) => {
  if (typeof value !== 'number') return 'Not available';
  return percentage ? `${value.toFixed(2)}%` : value.toFixed(2);
};

const sectorRelative = (value: number | null | undefined, benchmark: number | null | undefined) => {
  if (typeof value !== 'number' || typeof benchmark !== 'number' || benchmark === 0) return null;
  const delta = ((value - benchmark) / Math.abs(benchmark)) * 100;
  if (Math.abs(delta) < 2) return 'In line with sector';
  return value > benchmark ? 'Above sector' : 'Below sector';
};

const RatioGrid = ({
  metrics
}: {
  metrics: Array<{
    label: string;
    value: number | null | undefined;
    benchmark: number | null | undefined;
    percentage?: boolean;
  }>;
}) => {
  const visible = metrics.filter(
    (metric) => typeof metric.value === 'number' || typeof metric.benchmark === 'number'
  );
  if (!visible.length) {
    return <p className="text-sm text-slate-500">Not available</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {visible.map((metric) => {
        const relative = sectorRelative(metric.value, metric.benchmark);
        return (
          <div key={metric.label} className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">{metric.label}</div>
            <div className="mt-2 text-xl font-semibold text-white">
              {ratioText(metric.value, metric.percentage)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Sector: {ratioText(metric.benchmark, metric.percentage)}
            </div>
            {relative ? <div className="mt-2 text-xs text-slate-400">{relative}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

const MetricChip = ({
  label,
  value,
  note
}: {
  label: string;
  value: string;
  note?: string;
}) => (
  <div className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
    <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    {note ? <div className="mt-1 text-[11px] text-slate-500">{note}</div> : null}
  </div>
);

const optionalMetric = (
  label: string,
  value: string | null | undefined,
  note?: string
) => (value ? { label, value, note } : null);

const derivedNote = (source?: 'provider' | 'derived') =>
  source === 'derived' ? 'Derived' : undefined;

const buildKeyMetrics = (
  data: FundamentalsData,
  quote: PriceData | undefined,
  displayCurrency: CurrencyCode | null
) => {
  const sourceCurrency = quote?.sourceCurrency ?? data.company.identity.currency ?? '';
  return [
    quote
      ? {
          label: 'Price',
          value: formatMonetaryValue(
            quote.currentPrice,
            sourceCurrency,
            displayCurrency,
            quote.monetary?.currentPrice
          )
        }
      : null,
    optionalMetric(
      'Sector market cap',
      data.company.sectorMarketCapitalization
        ? formatConvertedMonetaryValue(data.company.sectorMarketCapitalization, ' Cr')
        : null
    ),
    optionalMetric(
      'P/E',
      typeof data.valuation.peRatio?.value === 'number'
        ? ratioText(data.valuation.peRatio.value)
        : null
    ),
    optionalMetric(
      'P/B',
      typeof data.valuation.pbRatio?.value === 'number'
        ? ratioText(data.valuation.pbRatio.value)
        : null
    ),
    optionalMetric(
      'ROE',
      typeof data.profitability.roe?.value === 'number'
        ? ratioText(data.profitability.roe.value, true)
        : null
    ),
    optionalMetric(
      'ROCE',
      typeof data.profitability.roce?.value === 'number'
        ? ratioText(data.profitability.roce.value, true)
        : null
    ),
    optionalMetric(
      'ROA',
      typeof data.profitability.roa?.value === 'number'
        ? ratioText(data.profitability.roa.value, true)
        : null
    ),
    optionalMetric(
      'EV / EBITDA',
      typeof data.valuation.evToEbitda?.value === 'number'
        ? ratioText(data.valuation.evToEbitda.value)
        : null
    ),
    optionalMetric(
      'Book value',
      data.perShare.bookValuePerShare
        ? formatConvertedMonetaryValue(data.perShare.bookValuePerShare)
        : null,
      derivedNote(data.perShare.bookValuePerShare?.source)
    ),
    optionalMetric(
      'EPS (basic)',
      data.perShare.eps ? formatConvertedMonetaryValue(data.perShare.eps) : null
    ),
    optionalMetric(
      'Dividend',
      data.perShare.dividendPerShare
        ? formatConvertedMonetaryValue(data.perShare.dividendPerShare)
        : null
    ),
    optionalMetric(
      'Dividend yield',
      data.perShare.dividendYield
        ? `${data.perShare.dividendYield.value.toFixed(2)}%`
        : null,
      derivedNote(data.perShare.dividendYield?.source)
    ),
    optionalMetric(
      'Face value',
      data.perShare.faceValue ? formatConvertedMonetaryValue(data.perShare.faceValue) : null,
      derivedNote(data.perShare.faceValue?.source)
    )
  ].filter((metric): metric is { label: string; value: string; note?: string } => Boolean(metric));
};

const FundamentalsOverview = ({
  data,
  quote,
  displayCurrency,
  loading,
  error
}: FundamentalsOverviewProps) => {
  const keyMetrics = data ? buildKeyMetrics(data, quote, displayCurrency) : [];

  return (
    <div className="space-y-4">
      <ResearchSection
        title="Key metrics"
        subtitle="Headline investor metrics from provider data. Derived figures are labeled."
        loading={loading}
        error={error}
        availability={data?.availability}
      >
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {keyMetrics.map((metric) => (
            <MetricChip key={metric.label} {...metric} />
          ))}
        </div>
      </ResearchSection>

      <div className="grid gap-4 xl:grid-cols-2">
        <ResearchSection
          title="Valuation"
          subtitle="Current company ratios compared with the provider's sector benchmark."
          loading={loading}
          error={error}
          availability={data?.valuationAvailability}
        >
          <RatioGrid
            metrics={[
              {
                label: 'P/E',
                value: data?.valuation.peRatio?.value,
                benchmark: data?.valuation.peRatio?.sectorBenchmark
              },
              {
                label: 'P/B',
                value: data?.valuation.pbRatio?.value,
                benchmark: data?.valuation.pbRatio?.sectorBenchmark
              },
              {
                label: 'EV / EBITDA',
                value: data?.valuation.evToEbitda?.value,
                benchmark: data?.valuation.evToEbitda?.sectorBenchmark
              }
            ]}
          />
        </ResearchSection>

        <ResearchSection
          title="Profitability"
          subtitle="Returns remain percentages and are never currency converted."
          loading={loading}
          error={error}
          availability={data?.profitabilityAvailability}
        >
          <RatioGrid
            metrics={[
              {
                label: 'ROE',
                value: data?.profitability.roe?.value,
                benchmark: data?.profitability.roe?.sectorBenchmark,
                percentage: true
              },
              {
                label: 'ROCE',
                value: data?.profitability.roce?.value,
                benchmark: data?.profitability.roce?.sectorBenchmark,
                percentage: true
              },
              {
                label: 'ROA',
                value: data?.profitability.roa?.value,
                benchmark: data?.profitability.roa?.sectorBenchmark,
                percentage: true
              }
            ]}
          />
        </ResearchSection>
      </div>

      <ResearchSection
        title="Company overview"
        subtitle={data?.company.sector ? `Sector: ${data.company.sector}` : undefined}
        loading={loading}
        error={error}
        availability={data?.company.availability}
      >
        <p className="text-sm leading-6 text-slate-300">
          {data?.company.businessDescription || 'No company description is available.'}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
            <div className="text-xs text-slate-500">ISIN</div>
            <div className="mt-1 text-sm font-medium text-white">
              {data?.company.identity.isin || 'Not available'}
            </div>
          </div>
          <div className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
            <div className="text-xs text-slate-500">Exchange</div>
            <div className="mt-1 text-sm font-medium text-white">
              {data?.company.identity.exchange || 'Not available'}
            </div>
          </div>
          <div className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
            <div className="text-xs text-slate-500">Sector market cap</div>
            <div className="mt-1 text-sm font-medium text-white">
              {formatConvertedMonetaryValue(data?.company.sectorMarketCapitalization, ' Cr')}
            </div>
          </div>
        </div>
      </ResearchSection>
    </div>
  );
};

export default FundamentalsOverview;
