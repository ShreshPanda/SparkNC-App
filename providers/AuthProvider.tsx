import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, type AuthSession } from '../services/authService';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  setSession: (session: AuthSession | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  status: 'loading',
  setSession: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    authService
      .restore()
      .then((restored) => {
        if (cancelled) return;
        setSessionState(restored);
        setStatus(restored ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (cancelled) return;
        setSessionState(null);
        setStatus('unauthenticated');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = (next: AuthSession | null) => {
    setSessionState(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
  };

  const value = useMemo(() => ({ session, status, setSession }), [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
