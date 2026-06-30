import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Box, FileText, MessageSquare, Star, Settings, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/stocks', label: 'Stocks', icon: Box },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User }
];

const Sidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      className="h-screen flex flex-col justify-between p-4 border-r border-gray-800 bg-gray-950"
    >
      <div>
        <div className="mb-6 text-xl font-semibold">MarketMind</div>
        <nav className="flex flex-col gap-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                end
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span>{it.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-gray-800"
      >
        <LogOut className="w-5 h-5" />
        {!collapsed && <span>Logout</span>}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
