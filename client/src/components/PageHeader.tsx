import React from 'react';

const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-1">
      <h1 className="text-page-title text-fg">{title}</h1>
      {subtitle ? <p className="text-sm text-fg-secondary">{subtitle}</p> : null}
    </div>
    {action}
  </div>
);

export default PageHeader;
