export type JournalDurationInput = {
  status: 'OPEN' | 'CLOSED';
  entryDate?: string | Date | null;
  entryTime?: string | null;
  exitDate?: string | Date | null;
  exitTime?: string | null;
  now?: Date;
};

export type JournalHoldingDuration = {
  holdingDurationMs: number | null;
  holdingDurationLabel: string | null;
  holdingDurationStatus: 'completed' | 'open' | null;
};

const toDate = (value?: string | Date | null, time?: string | null) => {
  if (!value) return null;
  if (value instanceof Date && Number.isNaN(value.getTime())) return null;
  if (value instanceof Date && !time) return value;
  const datePart = value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
  const clock = time && /^([01]\d|2[0-3]):[0-5]\d/.test(time) ? time : '00:00';
  const parsed = new Date(`${datePart}T${clock}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatHoldingDurationLabel = (ms: number) => {
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

export const calculateHoldingDuration = (input: JournalDurationInput): JournalHoldingDuration => {
  const entry = toDate(input.entryDate, input.entryTime);
  if (!entry) {
    return { holdingDurationMs: null, holdingDurationLabel: null, holdingDurationStatus: null };
  }

  if (input.status === 'CLOSED') {
    const exit = toDate(input.exitDate, input.exitTime);
    if (!exit || exit < entry) {
      return { holdingDurationMs: null, holdingDurationLabel: null, holdingDurationStatus: null };
    }
    const ms = exit.getTime() - entry.getTime();
    return {
      holdingDurationMs: ms,
      holdingDurationLabel: formatHoldingDurationLabel(ms),
      holdingDurationStatus: 'completed'
    };
  }

  const now = input.now ?? new Date();
  const ms = Math.max(0, now.getTime() - entry.getTime());
  return {
    holdingDurationMs: ms,
    holdingDurationLabel: `Currently open · ${formatHoldingDurationLabel(ms)}`,
    holdingDurationStatus: 'open'
  };
};
