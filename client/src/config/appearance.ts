export const APPEARANCE_OPTIONS = ['system', 'light', 'dark'] as const;

export type AppearancePreference = (typeof APPEARANCE_OPTIONS)[number];
export type ResolvedTheme = 'light' | 'dark';

export const APPEARANCE_STORAGE_KEY = 'marketmind-appearance';

export const isAppearancePreference = (value: unknown): value is AppearancePreference =>
  value === 'system' || value === 'light' || value === 'dark';

export const readStoredAppearance = (): AppearancePreference => {
  try {
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return isAppearancePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

export const writeStoredAppearance = (appearance: AppearancePreference) => {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
  } catch {
    // Private browsing can block storage; the in-memory theme still applies.
  }
};

export const resolveTheme = (appearance: AppearancePreference, systemDark = prefersDarkScheme()): ResolvedTheme =>
  appearance === 'light' ? 'light' : appearance === 'dark' ? 'dark' : systemDark ? 'dark' : 'light';

export const prefersDarkScheme = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const applyResolvedTheme = (appearance: AppearancePreference) => {
  const resolved = resolveTheme(appearance);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
  document.documentElement.dataset.appearance = appearance;
  document.documentElement.style.colorScheme = resolved;
};
