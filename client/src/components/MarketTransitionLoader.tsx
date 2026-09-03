import { TrendingUp } from 'lucide-react';

const MarketTransitionLoader = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm"
    role="status"
    aria-live="polite"
    aria-label="Updating market data"
  >
    <div className="w-[min(88vw,360px)] rounded-2xl border border-violet-500/20 bg-ink-900/95 p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-white">Updating your market</div>
          <div className="text-sm text-slate-400">Refreshing data and display preferences...</div>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-2 animate-pulse rounded-full bg-violet-500/25" />
        <div className="h-2 w-2/3 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  </div>
);

export default MarketTransitionLoader;
