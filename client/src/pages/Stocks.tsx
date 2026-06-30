import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';

const Stocks: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/stocks')
      .then((r) => r.json())
      .then((j) => setData(j.data || []));
  }, []);

  return (
    <div>
      <PageHeader title="Stocks" />
      <div className="grid gap-3">
        {data.map((s) => (
          <div key={s.symbol} className="p-3 bg-gray-800 rounded">{s.symbol} — {s.name} — ${s.price}</div>
        ))}
      </div>
    </div>
  );
};

export default Stocks;
