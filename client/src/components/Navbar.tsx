import React from 'react';
import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketContext } from '../context/MarketContext';
import {
  MARKETS,
  CURRENCIES,
  SUPPORTED_CURRENCIES,
  type CountryCode,
  type CurrencyCode
} from '../config/markets';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { country, currency, loading, setCountry, setCurrency } = useMarketContext();
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/6 bg-ink-950/60 px-3 backdrop-blur sm:gap-4 sm:px-6">
      <div className="hidden min-w-0 flex-1 md:block">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Search stocks, companies, reports..."
            className="w-full rounded-lg border border-white/6 bg-ink-900/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
          />
        </div>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <label className="sr-only" htmlFor="country-selector">
          Country
        </label>
        <select
          id="country-selector"
          value={country ?? ''}
          disabled={loading}
          onChange={(event) => {
            const value = event.target.value as CountryCode | '';
            void setCountry(value || null);
          }}
          className="w-24 rounded-lg border border-white/8 bg-ink-900/80 px-2 py-2 text-sm text-slate-200 outline-none transition hover:border-white/15 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-wait disabled:opacity-60 sm:w-40"
        >
          <option value="">Country</option>
          {Object.values(MARKETS).map((market) => (
            <option key={market.countryCode} value={market.countryCode}>
              {market.flag} {market.countryName}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="currency-selector">
          Display currency
        </label>
        <select
          id="currency-selector"
          value={currency ?? ''}
          disabled={loading}
          onChange={(event) => {
            const value = event.target.value as CurrencyCode | '';
            void setCurrency(value || null);
          }}
          className="w-20 rounded-lg border border-white/8 bg-ink-900/80 px-2 py-2 text-sm text-slate-200 outline-none transition hover:border-white/15 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-wait disabled:opacity-60 sm:w-24"
        >
          <option value="">Currency</option>
          {SUPPORTED_CURRENCIES.map((currencyCode) => (
            <option key={currencyCode} value={currencyCode}>
              {currencyCode} — {CURRENCIES[currencyCode].name}
            </option>
          ))}
        </select>

        <button className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-100 lg:inline-flex" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <Link to="/settings" className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-100 lg:inline-flex" aria-label="Settings">
          <SettingsIcon className="h-[18px] w-[18px]" />
        </Link>
        <Link to="/profile" className="ml-1 flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-3 transition hover:bg-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium leading-tight text-slate-100">{user?.name ?? 'Guest'}</div>
            <div className="text-xs leading-tight text-slate-500">{user?.email ?? ''}</div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
