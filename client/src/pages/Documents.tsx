import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/ui/EmptyState';

type DocumentItem = {
  id: string;
  title: string;
  type?: string;
  company?: string;
  uploadedAt?: string;
  size?: string;
};

const Documents: React.FC = () => {
  const [data, setData] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((j) => setData(j.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="A place for research files. Uploads are not available yet."
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Document upload and analysis are not available yet. This page is a placeholder for a later update."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-fg-muted">
                <th className="px-5 py-3 font-medium">Document</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Uploaded</th>
                <th className="px-5 py-3 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <tr key={doc.id} className="border-b border-line-subtle last:border-0 hover:bg-surface-hover">
                  <td className="px-5 py-3.5 font-medium text-fg">{doc.title}</td>
                  <td className="px-5 py-3.5 text-fg-secondary">{doc.type ?? '-'}</td>
                  <td className="px-5 py-3.5 text-fg-secondary">{doc.company ?? '-'}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{doc.uploadedAt ?? '-'}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{doc.size ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Documents;
