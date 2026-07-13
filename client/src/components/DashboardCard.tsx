import React from 'react';
import cn from 'classnames';

const DashboardCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('rounded-2xl border border-white/6 bg-ink-900/80 shadow-card p-5', className)}>{children}</div>
);

export default DashboardCard;
