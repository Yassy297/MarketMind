import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser, fetchMe, logout as logoutRequest } from '../services/auth.service';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await logoutRequest();
    } catch {
      // Session is already gone locally; nothing else to do if the server call fails.
    }
  }, []);

  useEffect(() => {
    // Session lives in an httpOnly cookie set by the server, so hydrate by asking
    // the API who the current user is rather than reading anything from storage.
    fetchMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    globalThis.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => globalThis.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const contextValue = React.useMemo(
    () => ({ user, loading, setUser, logout }),
    [user, loading, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
