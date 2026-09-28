/**
 * src/context/AuthContext.jsx  (Phase 4 — auto-refresh)
 * ─────────────────────────────────────────────────────────────────────────────
 * Global authentication state with automatic access-token renewal.
 *
 * Provides:
 *   user            — { id, email, firstName, lastName, role } | null
 *   authStatus      — 'loading' | 'authenticated' | 'unauthenticated'
 *   login(userData) — call after successful /api/auth/login
 *   logout()        — revokes refresh token + clears state
 *   refreshUser()   — re-fetches /api/auth/me
 *   apiFetch(url, opts) — authenticated fetch with auto-retry after token refresh
 *
 * TOKEN RENEWAL STRATEGY:
 *   When any API call returns 401 TOKEN_EXPIRED:
 *     1. Call POST /api/auth/refresh
 *     2. If refresh succeeds → retry original request once
 *     3. If refresh fails   → logout + redirect to /auth
 *   This means users never see a login screen mid-session unless their
 *   refresh token itself has expired (7 days of inactivity).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');

  // Guard against concurrent refresh calls
  const isRefreshing    = useRef(false);
  const refreshPromise  = useRef(null);

  // ── On mount: restore session ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setAuthStatus('authenticated');
        } else if (res.status === 401) {
          // Access token may have expired — try refresh before giving up
          const refreshed = await attemptRefresh();
          if (refreshed) {
            const res2 = await fetch('/api/auth/me', { credentials: 'include' });
            if (res2.ok) {
              setUser(await res2.json());
              setAuthStatus('authenticated');
              return;
            }
          }
          setUser(null);
          setAuthStatus('unauthenticated');
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      } catch {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core token refresh (deduplicated) ─────────────────────────────────────
  const attemptRefresh = useCallback(async () => {
    // If a refresh is already in-flight, wait for it instead of firing a second one
    if (isRefreshing.current) {
      return refreshPromise.current ?? Promise.resolve(false);
    }
    isRefreshing.current = true;
    refreshPromise.current = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setAuthStatus('authenticated');
          }
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        isRefreshing.current   = false;
        refreshPromise.current = null;
      }
    })();
    return refreshPromise.current;
  }, []);

  // ── apiFetch — authenticated fetch with auto-retry on 401 ─────────────────
  // Use this instead of raw fetch() for all authenticated API calls so that
  // token expiry is handled transparently.
  const apiFetch = useCallback(async (url, opts = {}) => {
    const options = { ...opts, credentials: 'include' };
    let res = await fetch(url, options);

    if (res.status === 401) {
      let body = {};
      try { body = await res.clone().json(); } catch {}

      if (body.code === 'TOKEN_EXPIRED' || body.code === 'TOKEN_INVALID') {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          res = await fetch(url, options);
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      }
    }

    return res;
  }, [attemptRefresh]);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback((userData) => {
    setUser(userData);
    setAuthStatus('authenticated');
  }, []);

  // ── logout — revokes server-side token ────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Still clear client state even if request fails
    }
    setUser(null);
    setAuthStatus('unauthenticated');
  }, []);

  // ── refreshUser — re-fetch /me (after profile updates) ────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) setUser(await res.json());
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, authStatus, login, logout, refreshUser, apiFetch, attemptRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function getUserRole(user) {
  const rawRole = user?.role ?? user?.userRole ?? user?.accountType ?? 'STUDENT';
  return String(rawRole).trim().toUpperCase();
}

export function useIsAdmin()     { return getUserRole(useAuth().user) === 'ADMIN'; }
export function useIsMentor()    { return getUserRole(useAuth().user) === 'MENTOR'; }
export function useIsRecruiter() { return getUserRole(useAuth().user) === 'RECRUITER'; }
export function useIsStudent()   { const { user } = useAuth(); return getUserRole(user) === 'STUDENT' || !user; }
