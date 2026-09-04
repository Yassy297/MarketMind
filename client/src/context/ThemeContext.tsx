import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { updateAppearance } from '../services/auth.service';
import {
  applyResolvedTheme,
  isAppearancePreference,
  readStoredAppearance,
  resolveTheme,
  writeStoredAppearance,
  type AppearancePreference
} from '../config/appearance';

type ThemeContextValue = {
  appearance: AppearancePreference;
  resolvedTheme: 'light' | 'dark';
  setAppearance: (appearance: AppearancePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useAuth();
  const [appearance, setAppearanceState] = useState<AppearancePreference>(readStoredAppearance);
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const lastPersisted = useRef<AppearancePreference>(appearance);

  useEffect(() => {
    applyResolvedTheme(appearance);
    writeStoredAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isAppearancePreference(user?.appearance)) return;
    if (user.appearance === lastPersisted.current) return;
    lastPersisted.current = user.appearance;
    setAppearanceState(user.appearance);
  }, [user?.appearance]);

  const setAppearance = useCallback((next: AppearancePreference) => {
    lastPersisted.current = next;
    setAppearanceState(next);
    writeStoredAppearance(next);
    applyResolvedTheme(next);
    if (!user) return;
    void updateAppearance(next)
      .then((updated) => {
        lastPersisted.current = updated.appearance ?? next;
        setUser({ ...user, appearance: updated.appearance ?? next });
      })
      .catch(() => {
        // Local preference still applies; the next authenticated load will reconcile.
      });
  }, [setUser, user]);

  const value = useMemo(
    () => ({
      appearance,
      resolvedTheme: resolveTheme(appearance, systemDark),
      setAppearance
    }),
    [appearance, setAppearance, systemDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
};
