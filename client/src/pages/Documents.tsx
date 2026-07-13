import React, { useEffect, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';

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
        title="My Documents"
        subtitle="Upload and analyze your financial documents."
        action={
          <Button size="sm">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/6 bg-ink-900/80 shadow-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <FileText className="h-8 w-8 text-slate-600" />
            <div className="text-sm font-medium text-slate-300">No documents yet</div>
            <p className="max-w-xs text-sm text-slate-500">Upload annual reports, earnings calls, or research notes to analyze them here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Document</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Uploaded</th>
                <th className="px-5 py-3 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <tr key={doc.id} className="border-b border-white/4 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-white">{doc.title}</td>
                  <td className="px-5 py-3.5 text-slate-300">{doc.type ?? '-'}</td>
                  <td className="px-5 py-3.5 text-slate-300">{doc.company ?? '-'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{doc.uploadedAt ?? '-'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{doc.size ?? '-'}</td>
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
