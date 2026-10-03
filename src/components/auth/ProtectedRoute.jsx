/**
 * ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps routes that require authentication.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <DashboardTab ... />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute roles={['ADMIN']}>
 *     <AdminTab ... />
 *   </ProtectedRoute>
 *
 * Behaviour:
 *   - While auth is loading: renders a full-page skeleton spinner
 *   - Unauthenticated: redirects to /auth
 *   - Wrong role: redirects to /dashboard with an informative message
 *   - Authenticated with correct role: renders children
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserRole, useAuth } from '../../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, roles }) {
  const { user, authStatus } = useAuth();
  const location = useLocation();

  // Still checking session cookie
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading your session…</p>
        </div>
      </div>
    );
  }

  // Not logged in → send to /auth, preserving return path
  if (authStatus === 'unauthenticated' || !user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Role guard
  if (roles && roles.length > 0 && !roles.includes(getUserRole(user))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
