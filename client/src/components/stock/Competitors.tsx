import type { CompetitorsResearch } from '../../types/market-data';
import { formatConvertedMonetaryValue } from '../../utils/currency';
import ResearchSection from './ResearchSection';

type CompetitorsProps = {
  data?: CompetitorsResearch;
  loading: boolean;
  error?: string | null;
};

const Competitors = ({ data, loading, error }: CompetitorsProps) => (
  <ResearchSection
    title="Competitors"
    subtitle="Peer companies returned by the fundamentals provider."
    loading={loading}
    error={error}
    availability={data?.availability}
  >
    <div className="grid gap-3 lg:grid-cols-2">
      {(data?.competitors ?? []).map((competitor) => (
        <article
          key={competitor.identity.instrumentKey ?? competitor.identity.isin}
          className="rounded-xl border border-line bg-surface-hover p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-medium text-fg">
                {competitor.identity.name || competitor.identity.displaySymbol || 'Company name unavailable'}
              </h4>
              <div className="mt-1 text-xs text-fg-muted">
                {[competitor.identity.exchange, competitor.identity.isin].filter(Boolean).join(' · ')}
              </div>
            </div>
            {competitor.sector ? (
              <span className="rounded-md bg-violet-500/10 px-2 py-1 text-xs text-brand">
                {competitor.sector}
              </span>
            ) : null}
          </div>
          {competitor.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-fg-secondary">
              {competitor.description}
            </p>
          ) : null}
          {competitor.sectorMarketCapitalization ? (
            <div className="mt-3 text-xs text-fg-muted">
              Sector market cap:{' '}
              <span className="text-fg-secondary">
                {formatConvertedMonetaryValue(competitor.sectorMarketCapitalization, ' Cr')}
              </span>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  </ResearchSection>
);

export default Competitors;
