import type { ReactNode } from 'react';
import { metricTone } from '../../utils/journal-metrics';

type ChartPoint = {
  label: string;
  value: number;
};

const ChartFrame = ({
  title,
  empty,
  children
}: {
  title: string;
  empty: boolean;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
    <h3 className="mb-4 text-sm font-medium text-fg-secondary">{title}</h3>
    {empty ? (
      <p className="py-10 text-center text-sm text-fg-muted">Closed trades with P&L will appear here.</p>
    ) : (
      children
    )}
  </section>
);

const padded = (values: number[]) => {
  const max = Math.max(...values.map(Math.abs), 1);
  return { max, min: -max };
};

export const JournalLineChart = ({ title, points }: { title: string; points: ChartPoint[] }) => {
  const width = 640;
  const height = 220;
  const pad = 28;
  const { max } = padded(points.map((point) => point.value));
  const innerWidth = width - pad * 2;
  const innerHeight = height - pad * 2;
  const coords = points.map((point, index) => {
    const x = pad + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
    const y = pad + ((max - point.value) / (max * 2)) * innerHeight;
    return { ...point, x, y };
  });
  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const zeroY = pad + innerHeight / 2;

  return (
    <ChartFrame title={title} empty={points.length === 0}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full text-brand" role="img" aria-label={title}>
        <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="currentColor" strokeOpacity="0.15" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" />
        {coords.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="3" fill="currentColor" />
        ))}
        {coords.filter((_, index) => index === 0 || index === coords.length - 1).map((point) => (
          <text key={point.label} x={point.x} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
            {point.label}
          </text>
        ))}
      </svg>
    </ChartFrame>
  );
};

export const JournalBarChart = ({ title, points }: { title: string; points: ChartPoint[] }) => {
  const width = 640;
  const height = 220;
  const pad = 28;
  const { max } = padded(points.map((point) => point.value));
  const innerWidth = width - pad * 2;
  const innerHeight = height - pad * 2;
  const barWidth = Math.max(8, innerWidth / Math.max(points.length, 1) - 8);
  const zeroY = pad + innerHeight / 2;

  return (
    <ChartFrame title={title} empty={points.length === 0}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label={title}>
        <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} className="stroke-white/15" />
        {points.map((point, index) => {
          const x = pad + index * (innerWidth / points.length) + 4;
          const barHeight = (Math.abs(point.value) / (max * 2)) * innerHeight;
          const y = point.value >= 0 ? zeroY - barHeight : zeroY;
          return (
            <g key={`${point.label}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                className={point.value >= 0 ? 'fill-emerald-400/80' : 'fill-rose-400/80'}
                rx="3"
              />
              {points.length <= 12 ? (
                <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {points.length > 0 ? (
        <div className="mt-2 flex justify-between text-xs text-fg-muted">
          <span className={metricTone(points[0]?.value)}>{points[0]?.label}</span>
          <span className={metricTone(points[points.length - 1]?.value)}>{points[points.length - 1]?.label}</span>
        </div>
      ) : null}
    </ChartFrame>
  );
};
