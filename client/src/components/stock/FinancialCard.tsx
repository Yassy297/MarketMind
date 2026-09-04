import React from 'react';

type FinancialCardProps = {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
};

const FinancialCard: React.FC<FinancialCardProps> = ({ label, value, loading = false }) => (
  <div className="rounded-xl border border-line-subtle bg-background-secondary p-4">
    <div className="text-xs font-medium uppercase tracking-wider text-fg-muted">{label}</div>
    {loading ? (
      <div className="mt-3 h-6 w-24 animate-pulse rounded bg-surface-hover" />
    ) : (
      <div className="mt-2 text-xl font-semibold tracking-tight text-fg sm:text-2xl">{value}</div>
    )}
  </div>
);

export default FinancialCard;
