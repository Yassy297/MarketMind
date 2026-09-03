import DateTimePicker from '../ui/DateTimePicker';
import { ASSET_CLASS_OPTIONS } from '../../config/journal';
import { MARKETS } from '../../config/markets';
import type { JournalAnalyticsFilters } from '../../types/journal';

export const FILTER_SELECT_CLASS =
  'rounded-lg border border-white/8 bg-ink-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/60';

export const emptyJournalFilters: JournalAnalyticsFilters = {
  from: '',
  to: '',
  assetClass: '',
  market: '',
  direction: '',
  strategy: '',
  setup: ''
};

export const compactJournalFilters = (filters: JournalAnalyticsFilters): JournalAnalyticsFilters => ({
  from: filters.from || undefined,
  to: filters.to || undefined,
  assetClass: filters.assetClass || undefined,
  market: filters.market || undefined,
  direction: filters.direction || undefined,
  strategy: filters.strategy || undefined,
  setup: filters.setup || undefined
});

const JournalReportFilters = ({
  value,
  onChange
}: {
  value: JournalAnalyticsFilters;
  onChange: (next: JournalAnalyticsFilters) => void;
}) => {
  const set = (key: keyof JournalAnalyticsFilters, next: string) => onChange({ ...value, [key]: next });

  return (
    <div className="grid gap-3 rounded-2xl border border-white/6 bg-ink-900/80 p-4 md:grid-cols-3 xl:grid-cols-6">
      <DateTimePicker type="date" value={value.from ?? ''} onChange={(next) => set('from', next)} />
      <DateTimePicker type="date" value={value.to ?? ''} onChange={(next) => set('to', next)} />
      <select className={FILTER_SELECT_CLASS} value={value.assetClass ?? ''} onChange={(event) => set('assetClass', event.target.value)}>
        <option value="">All assets</option>
        {ASSET_CLASS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select className={FILTER_SELECT_CLASS} value={value.market ?? ''} onChange={(event) => set('market', event.target.value)}>
        <option value="">All markets</option>
        {Object.values(MARKETS).map((market) => (
          <option key={market.market} value={market.market}>
            {market.flag} {market.countryName}
          </option>
        ))}
      </select>
      <select className={FILTER_SELECT_CLASS} value={value.direction ?? ''} onChange={(event) => set('direction', event.target.value)}>
        <option value="">All directions</option>
        <option value="LONG">Long</option>
        <option value="SHORT">Short</option>
      </select>
      <input
        className={FILTER_SELECT_CLASS}
        placeholder="Strategy"
        value={value.strategy ?? ''}
        onChange={(event) => set('strategy', event.target.value)}
      />
      <input
        className={`${FILTER_SELECT_CLASS} md:col-span-2 xl:col-span-3`}
        placeholder="Setup"
        value={value.setup ?? ''}
        onChange={(event) => set('setup', event.target.value)}
      />
    </div>
  );
};

export default JournalReportFilters;
