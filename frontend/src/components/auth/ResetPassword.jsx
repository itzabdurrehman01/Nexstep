import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  KeyRound, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle,
  CheckCircle2, Lock, ArrowRight, Check
} from 'lucide-react';

function PasswordStrength({ password, isUrdu }) {
  const checks = [
    { label: isUrdu ? '8+ حروف' : '8+ chars', ok: password.length >= 8 },
    { label: isUrdu ? 'بڑا حرف' : 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: isUrdu ? 'نمبر' : 'Number', ok: /[0-9]/.test(password) },
    { label: isUrdu ? 'خصوصی علامت' : 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-slate-200 dark:bg-slate-700', 'bg-red-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500'];
  const labels = [
    '',
    isUrdu ? 'بہت کمزور' : 'Weak',
    isUrdu ? 'مناسب' : 'Fair',
    isUrdu ? 'بہتر' : 'Good',
    isUrdu ? 'بہت مضبوط' : 'Strong',
  ];

  if (!password) return null;
  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-1.5" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
              i < score ? colors[score] : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex gap-2.5 flex-wrap">
          {checks.map((c, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 transition-colors ${
                c.ok ? 'text-emerald-700 dark:text-emerald-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {c.ok ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : '·'} {c.label}
            </span>
          ))}
        </div>
        <span
          className={`font-black uppercase tracking-wider text-[10px] ${
            score === 4
              ? 'text-emerald-700 dark:text-emerald-400'
              : score >= 2
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export function ResetPassword({
  token,
  onBackToLogin,
  onResetSuccess,
  lang = 'en',
  embedded = false,
}) {
  const isUrdu = lang === 'ur';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '', confirmPassword: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const errs = {
      password:
        password.length < 8
          ? isUrdu
            ? 'پاس ورڈ کم از کم 8 حروف پر مشتمل ہونا چاہیے'
            : 'Password must be at least 8 characters.'
          : !/[A-Z]/.test(password)
          ? isUrdu
            ? 'پاس ورڈ میں کم از کم ایک بڑا حرف ہونا چاہیے'
            : 'Password must contain at least one uppercase letter.'
          : !/[0-9]/.test(password)
          ? isUrdu
            ? 'پاس ورڈ میں کم از کم ایک عدد ہونا چاہیے'
            : 'Password must contain at least one number.'
          : '',
      confirmPassword:
        password !== confirmPassword
          ? isUrdu
            ? 'پاس ورڈز مطابقت نہیں رکھتے'
            : 'Passwords do not match.'
          : '',
    };
    setFieldErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed. The link may be expired or invalid.');
        return;
      }

      setIsSuccess(true);
      if (onResetSuccess) onResetSuccess();
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formBody = (
    <div className="w-full space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {isUrdu ? 'نیا پاس ورڈ سیٹ کریں' : 'Set New Password'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {isUrdu
            ? 'اپنے اکاؤنٹ کے لیے نیا اور مضبوط پاس ورڈ درج کریں۔'
            : 'Create a strong, new password with at least 8 characters.'}
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

      {isSuccess ? (
        <div className="space-y-5 pt-2">
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-emerald-900 dark:text-emerald-300 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-black">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isUrdu ? 'پاس ورڈ کامیابی سے اپ ڈیٹ ہو گیا!' : 'Password Updated Successfully!'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {isUrdu
                ? 'آپ کا نیا پاس ورڈ محفوظ ہو گیا ہے۔ اب آپ سائن اِن کر سکتے ہیں۔'
                : 'Your password has been changed. You can now sign in with your new credentials.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isUrdu ? 'سائن اِن کی طرف جائیں' : 'Continue to Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="reset-pwd" className="block text-xs font-black text-slate-900 dark:text-slate-200">
              {isUrdu ? 'نیا پاس ورڈ' : 'New Password'}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="reset-pwd"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                placeholder={isUrdu ? 'نیا پاس ورڈ درج کریں' : 'Enter new password'}
                disabled={isLoading}
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                  fieldErrors.password
                    ? 'border-2 border-red-500 focus:border-red-600'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.password}
              </p>
            )}
            <PasswordStrength password={password} isUrdu={isUrdu} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="reset-confirm-pwd" className="block text-xs font-black text-slate-900 dark:text-slate-200">
              {isUrdu ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm New Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="reset-confirm-pwd"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                placeholder={isUrdu ? 'دوبارہ پاس ورڈ درج کریں' : 'Re-enter new password'}
                disabled={isLoading}
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                  fieldErrors.confirmPassword
                    ? 'border-2 border-red-500 focus:border-red-600'
                    : confirmPassword && password === confirmPassword
                    ? 'border-2 border-emerald-600 focus:border-emerald-600'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isUrdu ? 'تبدیل ہو رہا ہے...' : 'Resetting Password...'}</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Reset Password'}</span>
                <ArrowRight className="w-4 h-4" />
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

export default ResetPassword;
