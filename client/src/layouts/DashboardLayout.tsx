import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col">
        <Navbar collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />
        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
