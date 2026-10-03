import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Mail, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  ShieldCheck, ArrowLeft, RefreshCw, Eye, EyeOff, Sparkles, Rocket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PinInput } from './PinInput.jsx';
import { SocialDetailsModal } from './SocialDetailsModal.jsx';

export function Login({
  onLoginSuccess,
  onSwitchToRegister,
  onForgotPassword,
  lang = 'en',
  embedded = false,
}) {
  const { login } = useAuth();
  const reduceMotion = useReducedMotion();
  const isUrdu = lang === 'ur';

  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'

  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [devOtpCode, setDevOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [socialPending, setSocialPending] = useState(null); // 'google' | 'github'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (otpStep === 'verify' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpStep, countdown]);

  const validateEmail = (val) => {
    const clean = (val || '').toLowerCase().trim();
    if (!clean) return isUrdu ? 'ای میل ایڈریس ضروری ہے' : 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return isUrdu ? 'درست ای میل ایڈریس درج کریں' : 'Please enter a valid email address.';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return isUrdu ? 'پاس ورڈ ضروری ہے' : 'Password is required.';
    return '';
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const urlRes  = await fetch('/api/auth/google/url');
      const urlData = await urlRes.json();
      if (urlRes.ok && urlData.url && urlData.configured) {
        window.location.href = urlData.url;
        return;
      }
      // Google not configured → fall through to modal
      setGoogleLoading(false);
      setSocialPending('google');
    } catch {
      setGoogleLoading(false);
      setSocialPending('google');
    }
  };

  const handleGithubSignIn = () => {
    setError('');
    setSocialPending('github');
  };

  const handleSocialModalConfirm = async ({ firstName, lastName, email: em }) => {
    const provider = socialPending;
    setSocialPending(null);
    provider === 'google' ? setGoogleLoading(true) : setGithubLoading(true);
    try {
      const socialRes = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: provider.toUpperCase(),
          profile: { email: em, firstName, lastName, avatarUrl: null, id: `${provider}_${Date.now()}` },
        }),
      });
      const socialData = await socialRes.json();
      if (!socialRes.ok) throw new Error(socialData.error || `${provider} authentication failed.`);
      login(socialData.user);
      setSuccess(isUrdu ? `خوش آمدید، ${socialData.user.firstName}!` : `Welcome back, ${socialData.user.firstName}!`);
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(socialData.user); }, 500);
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
      setGithubLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({ email: '', password: '' });

    const cleanEmail = email.toLowerCase().trim();
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, purpose: 'LOGIN' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP verification code.');
        return;
      }

      if (data.devOtpCode) setDevOtpCode(data.devOtpCode);
      setOtpStep('verify');
      setCountdown(60);
      setSuccess(isUrdu ? `6 ہندسوں کا کوڈ ${cleanEmail} پر بھیج دیا گیا ہے` : `A 6-digit code has been sent to ${cleanEmail}.`);
    } catch {
      setError('Unable to reach server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    const finalCode = (codeToVerify || otpCode).trim();
    if (!finalCode || finalCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.toLowerCase().trim(), otpCode: finalCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid verification code. Please check and try again.');
        return;
      }

      login(data.user);
      setSuccess(isUrdu ? `خوش آمدید، ${data.user.firstName}!` : `Authentication verified! Welcome back, ${data.user.firstName}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 500);
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({ email: '', password: '' });

    const cleanEmail = email.toLowerCase().trim();
    const emailErr = validateEmail(cleanEmail);
    const pwdErr = validatePassword(password);
    if (emailErr || pwdErr) {
      setFieldErrors({ email: emailErr, password: pwdErr });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      login(data.user);
      setSuccess(isUrdu ? `خوش آمدید، ${data.user.firstName}!` : `Welcome back, ${data.user.firstName}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 500);
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isBusy = isLoading || googleLoading || githubLoading;

  const formBody = (
    <div className="w-full space-y-5">
      {/* Title & Subtitle with Strong Contrast */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {isUrdu ? 'نیکسٹ اسٹیپ میں سائن اِن کریں' : 'Sign in to NexStep'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
          {isUrdu
            ? 'اپنا اکاؤنٹ استعمال کریں یا فوری ون ٹائم کوڈ سے لاگ ان کریں'
            : 'Access your AI career roadmap, university match, and scholarship tracker.'}
        </p>
      </div>

      {/* Alert Banners */}
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

      {success && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 font-bold shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{success}</span>
        </motion.div>
      )}

      {/* Social Auth Buttons with Visible Borders and Crisp Text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>Google</span>
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={handleGithubSignIn}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {githubLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          )}
          <span>GitHub</span>
        </button>
      </div>

      {/* Divider with High Contrast Text */}
      <div className="relative flex items-center justify-center my-3.5">
        <div className="border-t border-slate-300 dark:border-slate-800 w-full" />
        <span className="bg-slate-50/90 dark:bg-slate-900 px-3 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0">
          {isUrdu ? 'یا ای میل کے ذریعے لاگ ان کریں' : 'or continue with email'}
        </span>
      </div>

      {/* Auth Mode Toggle Pill (OTP vs Password) */}
      <div className="p-1 rounded-2xl bg-slate-200/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => { setAuthMode('otp'); setError(''); setFieldErrors({ email: '', password: '' }); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            authMode === 'otp'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'ون ٹائم پاس کوڈ (OTP)' : 'One-Time Code (OTP)'}</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMode('password'); setError(''); setFieldErrors({ email: '', password: '' }); }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            authMode === 'password'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'پاس ورڈ' : 'Password'}</span>
        </button>
      </div>

      {/* OTP Login Mode */}
      {authMode === 'otp' ? (
        <div className="space-y-4 pt-1">
          {otpStep === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="login-otp-email" className="block text-xs font-black text-slate-900 dark:text-slate-200">
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <input
                    id="login-otp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder="student@example.com"
                    disabled={isBusy}
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                      fieldErrors.email
                        ? 'border-2 border-red-500 focus:border-red-600'
                        : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {fieldErrors.email}
                  </p>
                )}
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  {isUrdu
                    ? 'ہم آپ کے ان باکس میں 6 ہندسوں کا کوڈ بھیجیں گے۔ پاس ورڈ یاد رکھنے کی ضرورت نہیں۔'
                    : "We'll send a 6-digit one-time password to your inbox. No password needed."}
                </p>
              </div>

              <button
                type="submit"
                disabled={isBusy || !email}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isUrdu ? 'کوڈ بھیجا جا رہا ہے...' : 'Sending Code...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isUrdu ? 'تصدیقی کوڈ بھیجیں' : 'Send Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-950 dark:text-white">
                    {isUrdu ? '6 ہندسوں کا کوڈ درج کریں' : 'Enter 6-Digit Code'}
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                    Sent to <strong className="text-slate-950 dark:text-slate-100">{email}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('request');
                    setOtpCode('');
                    setError('');
                  }}
                  className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'تبدیل کریں' : 'Change'}</span>
                </button>
              </div>

              {devOtpCode && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between shadow-2xs">
                  <span className="font-bold">Dev Test Code: <strong className="font-black text-emerald-950 dark:text-white">{devOtpCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(devOtpCode);
                      handleVerifyOtp(devOtpCode);
                    }}
                    className="underline text-[11px] font-black cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Autofill
                  </button>
                </div>
              )}

              <PinInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleVerifyOtp}
                disabled={isLoading}
                autoFocus={true}
                error={!!error}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Expires in 10 minutes</span>
                {countdown > 0 ? (
                  <span className="text-slate-600 dark:text-slate-300 font-semibold text-[11px]">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={isLoading}
                    className="text-emerald-700 dark:text-emerald-400 font-black hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isUrdu ? 'دوبارہ کوڈ بھیجیں' : 'Resend Code'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isUrdu ? 'تصدیق ہو رہی ہے...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isUrdu ? 'تصدیق کر کے داخل ہوں' : 'Verify & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Password Login Mode */
        <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="login-email-pwd" className="block text-xs font-black text-slate-900 dark:text-slate-200">
              {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="login-email-pwd"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="student@example.com"
                disabled={isBusy}
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                  fieldErrors.email
                    ? 'border-2 border-red-500 focus:border-red-600'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="login-pwd" className="text-xs font-black text-slate-900 dark:text-slate-200">
                {isUrdu ? 'پاس ورڈ' : 'Password'}
              </label>
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="login-pwd"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                placeholder={isUrdu ? 'اپنا پاس ورڈ درج کریں' : 'Enter your password'}
                disabled={isBusy}
                autoComplete="current-password"
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
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500/40 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isUrdu ? 'اس ڈیوائس پر یاد رکھیں' : 'Remember me on this device'}
            </span>
          </label>

          <button
            type="submit"
            disabled={isBusy || !email || !password}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isUrdu ? 'لاگ ان ہو رہا ہے...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? 'پاس ورڈ کے ساتھ سائن اِن کریں' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Switch to Register Callout with High Contrast */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-950 dark:text-white">
              {isUrdu ? 'نیکسٹ اسٹیپ پر نئے ہیں؟' : 'New to NexStep?'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
              {isUrdu ? 'طلبہ کے لیے ہمیشہ مفت ہے' : 'Create your AI career roadmap in under 2 minutes'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          {isUrdu ? 'اکاؤنٹ بنائیں' : 'Sign Up'}
        </button>
      </div>
    </div>
  );

  // If embedded in AuthTab, render form body directly
  if (embedded) {
    return (
      <>
        {socialPending && (
          <SocialDetailsModal
            provider={socialPending}
            onConfirm={handleSocialModalConfirm}
            onCancel={() => setSocialPending(null)}
          />
        )}
        {formBody}
      </>
    );
  }

  // Standalone mode (full screen page fallback)
  return (
    <>
      {socialPending && (
        <SocialDetailsModal
          provider={socialPending}
          onConfirm={handleSocialModalConfirm}
          onCancel={() => setSocialPending(null)}
        />
      )}
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl">
        {formBody}
        </div>
      </div>
    </>
  );
}

export default Login;
