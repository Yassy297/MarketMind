import React from 'react';

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-700 text-xs text-gray-200">{children}</span>
);

export default Badge;
