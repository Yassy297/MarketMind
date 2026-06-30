import React from 'react';

const EmptyState: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="p-8 text-center text-gray-400">
    <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
    {subtitle && <p className="mt-2">{subtitle}</p>}
  </div>
);

export default EmptyState;
