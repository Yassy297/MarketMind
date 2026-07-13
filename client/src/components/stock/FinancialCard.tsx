import React from 'react';

type FinancialCardProps = {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
};

const FinancialCard: React.FC<FinancialCardProps> = ({ label, value, loading = false }) => {
  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      {loading ? (
        <div className="mt-3 h-6 w-24 animate-pulse rounded bg-white/5" />
      ) : (
        <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      )}
    </div>
  );
};

export default FinancialCard;
