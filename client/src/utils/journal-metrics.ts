export const formatMetricNumber = (
  value: number | null | undefined,
  options: { signed?: boolean; digits?: number } = {}
) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const digits = options.digits ?? 2;
  const formatted = Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  if (options.signed) {
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `−${formatted}`;
    return formatted;
  }
  return value < 0 ? `−${formatted}` : formatted;
};

export const formatMetricPercent = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : `${value}%`;

export const formatMetricRatio = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(2);

export const metricTone = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'text-fg-secondary';
  if (value > 0) return 'text-positive';
  if (value < 0) return 'text-negative';
  return 'text-fg-secondary';
};

export const weekdayOrder = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];
