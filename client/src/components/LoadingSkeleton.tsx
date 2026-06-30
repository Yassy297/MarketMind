import React from 'react';

const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-800 ${className}`}>
    <div className="h-6 w-full rounded" />
  </div>
);

export default LoadingSkeleton;
