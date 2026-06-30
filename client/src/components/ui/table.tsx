import React from 'react';

export const Table: React.FC<{ columns: string[]; data: any[] }> = ({ columns, data }) => (
  <div className="overflow-auto rounded-md border border-gray-800">
    <table className="min-w-full text-left">
      <thead className="bg-gray-900">
        <tr>
          {columns.map((c) => (
            <th key={c} className="px-4 py-2 text-xs text-gray-400">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="odd:bg-gray-950">
            {columns.map((c) => (
              <td key={c} className="px-4 py-3">{String(row[c.toLowerCase()])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
