import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { getUserRole, useAuth } from '../../context/AuthContext.jsx';
import { Loader2, ShieldCheck, Rocket, ArrowLeft } from 'lucide-react';

export function ProtectedRoute({ children, roles }) {
  const { user, authStatus } = useAuth();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const loadingMotion = useMemo(() => reduceMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.35 } },
  [reduceMotion]);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" aria-hidden="true" />

        <motion.div
          {...loadingMotion}
          className="relative z-10 text-center space-y-6 max-w-sm mx-auto px-4"
        >
          <motion.div
            initial={reduceMotion ? {} : { scale: 0, rotate: -6 }}
            animate={reduceMotion ? {} : { scale: 1, rotate: 0 }}
            transition={reduceMotion ? {} : { type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/25 ring-4 ring-white/10"
          >
            <Rocket className="w-10 h-10" aria-hidden="true" />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-xl font-black text-white tracking-tight">
              Loading NexStep
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Securing your session and loading your profile…
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.div
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={reduceMotion ? {} : { duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            </motion.div>
            <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">
              Authenticating
            </span>
          </div>

          <div className="w-72 mx-auto pt-2">
            <div className="h-1 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={reduceMotion ? {} : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-4 opacity-80">
            <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="text-[11px] text-slate-500 font-semibold">
              Session secured with HttpOnly cookies
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated' || !user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(getUserRole(user))) {
    return (
      <Navigate
        to="/dashboard"
        state={{
          roleRestricted: true,
          requiredRoles: roles,
          userRole: getUserRole(user),
          from: location.pathname,
        }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
