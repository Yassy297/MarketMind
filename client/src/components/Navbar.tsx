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
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-3 backdrop-blur sm:gap-4 sm:px-6">
      <div className="hidden min-w-0 flex-1 md:block">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            placeholder="Search stocks, companies, reports..."
            aria-label="Search"
            className="mm-field h-10 py-0 pl-9"
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
          className="mm-field h-10 w-[7.25rem] py-0 sm:w-40"
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
          className="mm-field h-10 w-[5.5rem] py-0 sm:w-28"
        >
          <option value="">Currency</option>
          {SUPPORTED_CURRENCIES.map((currencyCode) => (
            <option key={currencyCode} value={currencyCode}>
              {currencyCode} — {CURRENCIES[currencyCode].name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-fg-secondary transition hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 lg:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <Link
          to="/settings"
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-fg-secondary transition hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 lg:inline-flex"
          aria-label="Settings"
        >
          <SettingsIcon className="h-[18px] w-[18px]" />
        </Link>
        <Link
          to="/profile"
          className="ml-1 flex h-10 items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 sm:pr-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium leading-tight text-fg">{user?.name ?? 'Guest'}</div>
            <div className="text-xs leading-tight text-fg-muted">{user?.email ?? ''}</div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
