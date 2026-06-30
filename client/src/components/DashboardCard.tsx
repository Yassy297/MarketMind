import React from 'react';

const DashboardCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 rounded bg-gray-800 shadow-sm">{children}</div>
);

export default DashboardCard;
