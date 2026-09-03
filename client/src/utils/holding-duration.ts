type DurationInput = {
  status: 'OPEN' | 'CLOSED';
  entryDate?: string;
  entryTime?: string;
  exitDate?: string | null;
  exitTime?: string;
};

const toDate = (value?: string | null, time?: string) => {
  if (!value) return null;
  const clock = time && /^([01]\d|2[0-3]):[0-5]\d/.test(time) ? time : '00:00';
  const parsed = new Date(`${value.slice(0, 10)}T${clock}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatLabel = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
};

export const previewHoldingDuration = (input: DurationInput): string => {
  const entry = toDate(input.entryDate, input.entryTime);
  if (!entry) return '—';
  if (input.status === 'CLOSED') {
    const exit = toDate(input.exitDate, input.exitTime);
    if (!exit || exit < entry) return '—';
    return formatLabel(exit.getTime() - entry.getTime());
  }
  return `Currently open · ${formatLabel(Date.now() - entry.getTime())}`;
};
