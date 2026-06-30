import React from 'react';
import StatCard from '../components/StatCard';
import DashboardCard from '../components/DashboardCard';

const Dashboard: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Demo!</h1>
          <div className="text-sm text-gray-400">Here's what's happening in the market today.</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard label="Market Overview" value={<div className="text-lg">+1.23%</div>} />
        <StatCard label="My Watchlist" value={<div className="text-lg">12</div>} />
        <StatCard label="Documents" value={<div className="text-lg">3</div>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardCard>
          <h3 className="font-semibold">Market Summary</h3>
          <div className="mt-3 text-sm text-gray-400">A quick glance at indices and movers.</div>
        </DashboardCard>

        <div className="lg:col-span-2">
          <DashboardCard>
            <h3 className="font-semibold">Recent Activity</h3>
            <div className="mt-3 text-sm text-gray-400">Latest trades, watchlist updates, and documents uploaded.</div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
