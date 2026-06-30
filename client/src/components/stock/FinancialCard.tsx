import React from 'react';

type FinancialCardProps = {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
};

const FinancialCard: React.FC<FinancialCardProps> = ({ label, value, loading = false }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
      <div className="text-sm text-gray-400">{label}</div>
      {loading ? (
        <div className="mt-3 h-6 w-24 animate-pulse rounded bg-gray-800" />
      ) : (
        <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      )}
    </div>
  );
};

export default FinancialCard;
