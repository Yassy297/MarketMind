import { useMemo, useState } from 'react';
import { formatMetricNumber, formatMetricPercent, metricTone } from '../../utils/journal-metrics';
import type { JournalGroupRow } from '../../types/journal';

type SortKey = 'key' | 'trades' | 'wins' | 'losses' | 'winRate' | 'netPnl' | 'averagePnl' | 'bestTrade' | 'worstTrade';

type Column = {
  key: SortKey;
  label: string;
  numeric?: boolean;
};

const defaultColumns: Column[] = [
  { key: 'key', label: 'Name' },
  { key: 'trades', label: 'Trades', numeric: true },
  { key: 'wins', label: 'Wins', numeric: true },
  { key: 'losses', label: 'Losses', numeric: true },
  { key: 'winRate', label: 'Win rate', numeric: true },
  { key: 'netPnl', label: 'Net P&L', numeric: true },
  { key: 'averagePnl', label: 'Average P&L', numeric: true },
  { key: 'bestTrade', label: 'Best', numeric: true },
  { key: 'worstTrade', label: 'Worst', numeric: true }
];

const compare = (left: JournalGroupRow, right: JournalGroupRow, key: SortKey, direction: 'asc' | 'desc') => {
  const a = left[key];
  const b = right[key];
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'string' && typeof b === 'string') {
    return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  }
  return direction === 'asc' ? Number(a) - Number(b) : Number(b) - Number(a);
};

const cell = (row: JournalGroupRow, key: SortKey) => {
  if (key === 'key') return row.key;
  if (key === 'trades' || key === 'wins' || key === 'losses') return row[key];
  if (key === 'winRate') return formatMetricPercent(row.winRate);
  const value = row[key];
  return <span className={metricTone(value)}>{formatMetricNumber(value, { signed: true })}</span>;
};

const JournalAnalyticsTable = ({
  rows,
  columns = defaultColumns,
  emptyLabel = 'No trades match these filters.',
  nameLabel
}: {
  rows: JournalGroupRow[];
  columns?: Column[];
  emptyLabel?: string;
  nameLabel?: string;
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('netPnl');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const visible = useMemo(
    () =>
      rows
        .slice()
        .sort((left, right) => compare(left, right, sortKey, direction)),
    [rows, sortKey, direction]
  );

  const toggle = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setDirection(key === 'key' ? 'asc' : 'desc');
  };

  if (rows.length === 0) {
    return <div className="p-10 text-center text-sm text-fg-muted">{emptyLabel}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-fg-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 font-medium ${column.numeric ? 'text-right' : ''}`}>
                <button type="button" className="hover:text-fg" onClick={() => toggle(column.key)}>
                  {column.key === 'key' && nameLabel ? nameLabel : column.label}
                  {sortKey === column.key ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.key} className="border-b border-line-subtle last:border-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 ${column.numeric ? 'text-right tabular-nums' : 'text-fg'} ${
                    column.key === 'key' ? 'font-medium' : 'text-fg-secondary'
                  }`}
                >
                  {cell(row, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JournalAnalyticsTable;
