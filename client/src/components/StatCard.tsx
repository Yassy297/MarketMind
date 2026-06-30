import React from 'react';

const StatCard: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="p-4 rounded bg-gray-800">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

export default StatCard;
