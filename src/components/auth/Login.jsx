import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Login({ onLoginSuccess, onSwitchToRegister, onForgotPassword }) {
  const { login } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // Persist auth state globally
      login(data.user);
      setSuccess(`Welcome back, ${data.user.firstName}!`);

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 600);
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Sign in to NexStep AI</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
            Create one free
          </button>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@nexstep.edu.pk"
              autoComplete="email"
              required
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-semibold"
            >
              Forgot password?
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      {/* Dev credentials hint */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
        <p className="font-bold text-slate-600 dark:text-slate-300 text-xs">Development accounts:</p>
        <p>Student: demo@nexstep.edu.pk / Student@123</p>
        <p>Admin: admin@nexstep.edu.pk / Admin@nexstep1</p>
        <p>Mentor: mentor@nexstep.edu.pk / Mentor@123</p>
      </div>
    </div>
  );
}
