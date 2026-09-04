import BrandMark from './BrandMark';

const MarketTransitionLoader = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    role="status"
    aria-live="polite"
    aria-label="Updating market data"
  >
    <div className="w-[min(88vw,360px)] rounded-xl border border-line bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <BrandMark size={40} />
        <div>
          <div className="font-semibold text-fg">Updating your market</div>
          <div className="text-sm text-fg-secondary">Refreshing data and display preferences...</div>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-2 animate-pulse rounded-full bg-brand-subtle" />
        <div className="h-2 w-2/3 animate-pulse rounded-full bg-surface-hover" />
      </div>
    </div>
  </div>
);

export default MarketTransitionLoader;
