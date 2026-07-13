import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LineChart, Star, MessageSquare, FileText, Settings, User, LogOut, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stocks', label: 'Stocks', icon: LineChart },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User }
];

const Sidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 240 }}
      className="h-screen shrink-0 flex flex-col justify-between border-r border-white/6 bg-ink-950 px-3 py-5"
    >
      <div>
        <div className={`mb-8 flex items-center gap-2 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-white">MarketMind</span>}
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-gradient-soft text-white ring-1 ring-inset ring-violet-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-violet-300' : ''}`} />
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
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-300 ${collapsed ? 'justify-center' : ''}`}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span>Logout</span>}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
