import React from 'react';
import cn from 'classnames';

const DashboardCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}> = ({ children, className, variant = 'primary' }) => (
  <div className={cn(variant === 'secondary' ? 'mm-card-secondary' : 'mm-card', className)}>{children}</div>
);

export default DashboardCard;
