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
  <section className="rounded-2xl border border-white/6 bg-ink-900/80 p-5 shadow-card">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>

    {loading ? (
      <div className="space-y-3" aria-label={`Loading ${title}`}>
        <div className="h-10 animate-pulse rounded-lg bg-white/5" />
        <div className="h-10 animate-pulse rounded-lg bg-white/5" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/5" />
      </div>
    ) : error ? (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
        {error}
      </div>
    ) : availability && availability.status !== 'available' ? (
      <div className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">
        {availability.message ?? 'Not available for this instrument.'}
      </div>
    ) : (
      children
    )}
  </section>
);

export default ResearchSection;
