import React from 'react';
import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC<{ collapsed?: boolean; onToggle?: () => void }> = ({ onToggle }) => {
  const { user } = useAuth();
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/6 bg-ink-950/60 px-6 backdrop-blur">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Search stocks, companies, reports..."
            className="w-full rounded-lg border border-white/6 bg-ink-900/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-100" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <Link to="/settings" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-100" aria-label="Settings">
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
