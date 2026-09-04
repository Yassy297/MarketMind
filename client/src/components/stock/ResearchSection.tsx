import type { ReactNode } from 'react';
import type { SectionAvailability } from '../../types/market-data';

type ResearchSectionProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  error?: string | null;
  availability?: SectionAvailability;
  children: ReactNode;
};

const ResearchSection = ({
  title,
  subtitle,
  action,
  loading = false,
  error,
  availability,
  children
}: ResearchSectionProps) => (
  <section className="mm-card">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h3 className="text-section-title text-fg">{title}</h3>
        {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>

    {loading ? (
      <div className="space-y-3" aria-label={`Loading ${title}`}>
        <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-10 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    ) : error ? (
      <div className="mm-alert-warning" role="alert">
        {error}
      </div>
    ) : availability && availability.status !== 'available' ? (
      <div className="rounded-lg border border-dashed border-line p-4 text-sm text-fg-muted">
        {availability.message ?? 'Not available for this instrument.'}
      </div>
    ) : (
      children
    )}
  </section>
);

export default ResearchSection;
