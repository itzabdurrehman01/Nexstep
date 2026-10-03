import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldCheck,
  Send, RefreshCw, KeyRound
} from 'lucide-react';

export function ForgotPassword({ onBackToLogin, onCheckEmail, lang = 'en', embedded = false }) {
  const reduceMotion = useReducedMotion();
  const isUrdu = lang === 'ur';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const validateEmail = (val) => {
    const clean = (val || '').toLowerCase().trim();
    if (!clean) return isUrdu ? 'ای میل ایڈریس ضروری ہے' : 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return isUrdu ? 'درست ای میل ایڈریس درج کریں' : 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setFieldError('');

    const err = validateEmail(email);
    if (err) {
      setFieldError(err);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send password reset link. Please try again.');
        return;
      }

      setIsSubmitted(true);
      setResendCooldown(60);
      if (onCheckEmail) onCheckEmail(email.toLowerCase().trim());
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const formBody = (
    <div className="w-full space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot Your Password?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {isUrdu
            ? 'اپنا رجسٹرڈ ای میل درج کریں۔ ہم آپ کو پاس ورڈ ری سیٹ کرنے کا محفوظ لنک بھیجیں گے۔'
            : 'Enter your registered email address and we will send you a secure link to reset your password.'}
        </p>
      </div>

      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-500/40 text-red-800 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5 font-bold shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </motion.div>
      )}

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5 pt-2"
        >
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-emerald-900 dark:text-emerald-300 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-black">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isUrdu ? 'ری سیٹ لنک بھیج دیا گیا ہے!' : 'Reset Link Dispatched!'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {isUrdu
                ? `ہم نے پاس ورڈ ری سیٹ کرنے کی ہدایات ${email} پر بھیج دی ہیں۔ براہ کرم اپنا ان باکس اور سپیم فولڈر چیک کریں۔`
                : `We have sent password reset instructions to ${email}. Please check your inbox and spam folder.`}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              {isUrdu ? 'یہ لنک 15 منٹ تک کارآمد رہے گا۔' : 'The link will expire in 15 minutes.'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
              {isUrdu ? 'ای میل موصول نہیں ہوئی؟' : "Didn't receive an email?"}
            </span>
            {resendCooldown > 0 ? (
              <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                {isUrdu ? `${resendCooldown} سیکنڈ میں دوبارہ بھیجیں` : `Resend in ${resendCooldown}s`}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="text-emerald-700 dark:text-emerald-400 font-black hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isUrdu ? 'دوبارہ لنک بھیجیں' : 'Resend Link'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-xs"
          >
            {isUrdu ? 'سائن اِن کی طرف واپس جائیں' : 'Back to Sign In'}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className="block text-xs font-black text-slate-900 dark:text-slate-200">
              {isUrdu ? 'رجسٹرڈ ای میل ایڈریس' : 'Registered Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError('');
                }}
                placeholder="student@example.com"
                disabled={isLoading}
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                  fieldError
                    ? 'border-2 border-red-500 focus:border-red-600'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
            </div>
            {fieldError && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isUrdu ? 'بھیجا جا رہا ہے...' : 'Sending Link...'}</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? 'ری سیٹ لنک بھیجیں' : 'Send Reset Link'}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs font-black text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'سائن اِن کی طرف واپس جائیں' : 'Back to Sign In'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (embedded) {
    return formBody;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl">
        {formBody}
      </div>
    </div>
  );
}

export default ForgotPassword;
