import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser, fetchMe } from '../services/auth.service';
import { setAuthToken } from '../services/api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setToken: (t: string | null, user?: AuthUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setTokenState(null);
    setUser(null);
    localStorage.removeItem('marketmind-token');
    setAuthToken(null);
  }, []);

  const setToken = useCallback((t: string | null, user?: AuthUser | null) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem('marketmind-token', t);
      setAuthToken(t);
      setUser(user ?? null);
    } else {
      localStorage.removeItem('marketmind-token');
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('marketmind-token');
    if (!stored) {
      setLoading(false);
      return;
    }

    setAuthToken(stored);
    fetchMe()
      .then((data) => {
        setTokenState(stored);
        setUser(data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    globalThis.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => globalThis.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const contextValue = React.useMemo(
    () => ({ user, token, loading, setToken, logout }),
    [user, token, loading, setToken, logout],
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
