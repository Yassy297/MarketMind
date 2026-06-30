import React from 'react';

const Card: React.FC<{ className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-gray-800 rounded-md p-4 shadow-sm ${className}`}>{children}</div>
);

export default Card;
