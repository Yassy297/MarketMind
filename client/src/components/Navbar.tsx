import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

const Navbar: React.FC<{ collapsed?: boolean; onToggle?: () => void }> = ({ onToggle }) => {
  const { user } = useAuth();
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900">
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className="p-2 rounded hover:bg-gray-800">☰</button>
        <div className="text-lg font-semibold">Dashboard</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input placeholder="Search" className="bg-gray-800 rounded-md px-3 py-2 pr-10 text-sm text-gray-100" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="text-sm text-gray-300">{user ? `Hi, ${user.name}` : 'Not signed in'}</div>
      </div>
    </header>
  );
};

export default Navbar;
