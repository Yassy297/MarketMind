import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LineChart, BookOpen, Star, MessageSquare, FileText, Settings, User, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BrandMark from './BrandMark';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stocks', label: 'Stocks', icon: LineChart },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User }
];

const Sidebar: React.FC<{ collapsed?: boolean; onToggle?: () => void }> = ({
  collapsed = false,
  onToggle
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 232 }}
      className="flex h-screen shrink-0 flex-col justify-between border-r border-line bg-surface px-2.5 py-4"
    >
      <div>
        <div className="mb-7 flex items-center gap-1 px-1">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-secondary transition hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <BrandMark size={32} />
          {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-fg">MarketMind</span>}
        </div>

        <nav className="flex flex-col gap-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
                    isActive
                      ? 'bg-brand-subtle text-fg ring-1 ring-inset ring-brand/25'
                      : 'text-fg-secondary hover:bg-surface-hover hover:text-fg'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-brand' : ''}`} />
                    {!collapsed && <span className="font-medium">{it.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-hover hover:text-negative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${collapsed ? 'justify-center px-2' : ''}`}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span>Logout</span>}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
