export const resolvePresetOrCustom = (
  value: string | undefined,
  options: readonly string[]
): { selected: string; custom: string } => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return { selected: '', custom: '' };
  if (options.includes(trimmed)) return { selected: trimmed, custom: '' };
  return { selected: 'Custom', custom: trimmed };
};

export const persistPresetOrCustom = (selected: string, custom: string): string | undefined => {
  if (selected === 'Custom') {
    const trimmed = custom.trim();
    return trimmed || undefined;
  }
  return selected.trim() || undefined;
};
