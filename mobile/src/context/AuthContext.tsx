/**
 * mobile/src/context/AuthContext.tsx
 * Global authentication state for the mobile app.
 * Uses SecureStore for token persistence — no HttpOnly cookies.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe, LoginPayload, User } from '../api/auth';
import { getAccessToken } from '../api/client';

interface AuthContextValue {
  user: User | null;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,       setUser]       = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // On mount: check for a stored token and fetch /me
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) { setAuthStatus('unauthenticated'); return; }
        const me = await getMe();
        if (me) { setUser(me); setAuthStatus('authenticated'); }
        else    { setAuthStatus('unauthenticated'); }
      } catch {
        setAuthStatus('unauthenticated');
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const userData = await apiLogin(payload);
    setUser(userData);
    setAuthStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setAuthStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getMe();
    if (me) setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authStatus, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
