import React, { useState } from 'react';
import { Loader2, X, User, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Modal that collects name + email before creating a social account ─────────
function SocialDetailsModal({ provider, onConfirm, onCancel }) {
  const label = provider === 'github' ? 'GitHub' : provider === 'linkedin' ? 'LinkedIn' : 'Google';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim())  return setError('First name is required.');
    if (!lastName.trim())   return setError('Last name is required.');
    const em = email.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
      return setError('A valid email address is required.');
    setError('');
    setLoading(true);
    onConfirm({ firstName: firstName.trim(), lastName: lastName.trim(), email: em });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 relative">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Complete your {label} sign-in
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We need a few details to create your NexStep account.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); setError(''); }}
                  placeholder="Ahmed"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); setError(''); }}
                  placeholder="Khan"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="student@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><ArrowRight className="w-3.5 h-3.5" /> Continue</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main SocialAuthButtons component ─────────────────────────────────────────
export function SocialAuthButtons({ onSuccess, onError, disabled }) {
  const { login } = useAuth();
  const [loadingProvider, setLoadingProvider]     = useState(null);
  const [pendingProvider, setPendingProvider]     = useState(null); // 'github' | 'linkedin'

  const doSocialLogin = async (provider, profile) => {
    const res = await fetch('/api/auth/social-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider, profile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to sign in with ${provider}`);
    return data;
  };

  const handleGoogle = async () => {
    if (disabled || loadingProvider) return;
    setLoadingProvider('google');
    if (onError) onError('');
    try {
      // Try real Google OAuth first
      const urlRes  = await fetch('/api/auth/google/url');
      const urlData = await urlRes.json();
      if (urlRes.ok && urlData.url && urlData.configured) {
        window.location.href = urlData.url;
        return; // page navigates away — don't clear loading
      }
      // Google not configured → show details modal (same as github/linkedin)
      setLoadingProvider(null);
      setPendingProvider('google');
    } catch {
      setLoadingProvider(null);
      setPendingProvider('google');
    }
  };

  const handleGitHubOrLinkedIn = (provider) => {
    if (disabled || loadingProvider) return;
    if (onError) onError('');
    setPendingProvider(provider);
  };

  const handleModalConfirm = async ({ firstName, lastName, email }) => {
    const provider = pendingProvider;
    setPendingProvider(null);
    setLoadingProvider(provider);
    try {
      const data = await doSocialLogin(provider, {
        email,
        firstName,
        lastName,
        avatarUrl: null,
        id: `${provider}_${Date.now()}`,
      });
      login(data.user);
      if (onSuccess) onSuccess(data.user);
    } catch (err) {
      if (onError) onError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleModalCancel = () => setPendingProvider(null);

  return (
    <>
      {/* Details modal for GitHub / LinkedIn (and Google fallback) */}
      {pendingProvider && (
        <SocialDetailsModal
          provider={pendingProvider}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      <div className="space-y-3">
        {/* ── Google ── */}
        <button
          type="button"
          disabled={disabled || !!loadingProvider}
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            hover:bg-slate-50 dark:hover:bg-slate-700
            text-slate-800 dark:text-slate-100
            text-xs font-bold transition-all shadow-xs hover:shadow-sm
            active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500 dark:text-slate-400" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* ── GitHub ── */}
          <button
            type="button"
            disabled={disabled || !!loadingProvider}
            onClick={() => handleGitHubOrLinkedIn('github')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl
              border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800
              hover:bg-slate-50 dark:hover:bg-slate-700
              text-slate-800 dark:text-slate-100
              text-xs font-bold transition-all shadow-xs hover:shadow-sm
              active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loadingProvider === 'github' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true"
                fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            <span>GitHub</span>
          </button>

          {/* ── LinkedIn ── */}
          <button
            type="button"
            disabled={disabled || !!loadingProvider}
            onClick={() => handleGitHubOrLinkedIn('linkedin')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl
              border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800
              hover:bg-slate-50 dark:hover:bg-slate-700
              text-slate-800 dark:text-slate-100
              text-xs font-bold transition-all shadow-xs hover:shadow-sm
              active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loadingProvider === 'linkedin' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A66C2]" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true"
                fill="#0A66C2">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            )}
            <span>LinkedIn</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          <span className="mx-3 text-[10px] font-bold uppercase tracking-wider
            text-slate-500 dark:text-slate-400
            bg-white dark:bg-slate-900 px-1">
            Or continue with email
          </span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
        </div>
      </div>
    </>
  );
}

export default SocialAuthButtons;
