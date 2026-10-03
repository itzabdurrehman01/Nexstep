/**
 * SocialDetailsModal.jsx
 * Collects first name, last name, and email from the user before creating
 * a social account (GitHub / LinkedIn / Google-fallback).
 * Shown as a full-screen overlay so it works whether the auth form is
 * embedded inside AuthTab or rendered standalone.
 */
import React, { useState } from 'react';
import { X, User, Mail, ArrowRight, Loader2 } from 'lucide-react';

const PROVIDER_LABELS = {
  google:   'Google',
  github:   'GitHub',
  linkedin: 'LinkedIn',
};

export function SocialDetailsModal({ provider, onConfirm, onCancel }) {
  const label = PROVIDER_LABELS[provider] ?? provider;
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handle = (e) => {
    e.preventDefault();
    if (!firstName.trim())  return setError('First name is required.');
    if (!lastName.trim())   return setError('Last name is required.');
    const em = email.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
      return setError('Please enter a valid email address.');
    setError('');
    setLoading(true);
    onConfirm({ firstName: firstName.trim(), lastName: lastName.trim(), email: em });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Complete ${label} sign-in`}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 relative">

        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="absolute top-4 right-4 p-1.5 rounded-xl
            text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Provider icon + title */}
        <div className="space-y-1 pr-8">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Complete your {label} sign-in
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter your name and email to create your NexStep account.
            You can always update these later.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handle} className="space-y-3" noValidate>
          {/* Name row */}
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
                  autoComplete="given-name"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl
                    border border-slate-200 dark:border-slate-700
                    bg-slate-50 dark:bg-slate-800
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
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
                  autoComplete="family-name"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl
                    border border-slate-200 dark:border-slate-700
                    bg-slate-50 dark:bg-slate-800
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Email */}
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
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-900 dark:text-white
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl
                border border-slate-200 dark:border-slate-700
                text-xs font-bold text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl
                bg-emerald-600 hover:bg-emerald-700 text-white
                text-xs font-extrabold
                flex items-center justify-center gap-1.5
                transition-colors disabled:opacity-50
                shadow-md shadow-emerald-600/20"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <><ArrowRight className="w-3.5 h-3.5" /> Continue</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SocialDetailsModal;
