import React from 'react';

const PageHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold">{title}</h1>
    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
  </div>
);

export default PageHeader;
