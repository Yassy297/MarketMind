import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';

const Documents: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((j) => setData(j.data || []));
  }, []);

  return (
    <div>
      <PageHeader title="Documents" />
      <div className="grid gap-3">
        {data.map((d) => (
          <div key={d.id} className="p-3 bg-gray-800 rounded">{d.title}</div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
