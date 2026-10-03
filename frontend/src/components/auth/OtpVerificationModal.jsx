import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, ArrowRight, RotateCw, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function OtpVerificationModal({
  email,
  purpose = 'REGISTER',
  onVerified,
  onCancel,
  initialDevCode = '',
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devCode, setDevCode] = useState(initialDevCode);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first digit input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only accept single numeric digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = cleaned;
    setDigits(nextDigits);
    setError('');

    // Advance to next input if digit entered
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      nextDigits[i] = pasteData[i];
    }
    setDigits(nextDigits);

    const nextFocusIndex = Math.min(pasteData.length, 5);
    if (inputRefs.current[nextFocusIndex]) {
      inputRefs.current[nextFocusIndex].focus();
    }
  };

  const handleFillDevCode = () => {
    if (!devCode || devCode.length !== 6) return;
    const split = devCode.split('');
    setDigits(split);
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otpCode, purpose }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please try again.');
      }

      setSuccessMsg('Code verified successfully!');
      setTimeout(() => {
        if (onVerified) onVerified({ otpCode, verificationToken: data.verificationToken });
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, purpose }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code.');
      }

      setCountdown(60);
      setCanResend(false);
      setSuccessMsg('New 6-digit code has been sent!');
      if (data.devOtpCode) setDevCode(data.devOtpCode);
    } catch (err) {
      setError(err.message || 'Could not resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-300 dark:border-emerald-800/50 shadow-inner">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-slate-950 dark:text-white">Verify Your Account</h2>
        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs mx-auto font-medium">
          We sent a 6-digit verification code to{' '}
          <span className="font-bold text-slate-950 dark:text-white break-all">{email}</span>
        </p>
      </div>

      {devCode && (
        <button
          type="button"
          onClick={handleFillDevCode}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 text-xs text-emerald-900 dark:text-emerald-300 font-bold cursor-pointer hover:bg-emerald-100/80 transition-colors shadow-2xs"
          title="Click to auto-fill development OTP"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dev Fast-Fill OTP: <strong className="font-black text-emerald-950 dark:text-white">{devCode}</strong></span>
          </span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
            Click to fill
          </span>
        </button>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 font-bold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6-box OTP digits */}
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={isLoading}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-black rounded-2xl border transition-all ${
                digit
                  ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-950 dark:text-white'
                  : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:border-slate-400'
              } focus:outline-none focus:border-2 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || digits.join('').length !== 6}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Verifying Code…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> Verify & Complete
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="font-bold hover:text-slate-950 dark:hover:text-white hover:underline cursor-pointer"
        >
          ← Change details
        </button>

        <button
          type="button"
          disabled={!canResend || isResending}
          onClick={handleResend}
          className={`flex items-center gap-1.5 font-black cursor-pointer transition-colors ${
            canResend
              ? 'text-emerald-700 dark:text-emerald-400 hover:underline'
              : 'text-slate-500 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          {isResending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCw className="w-3.5 h-3.5" />
          )}
          <span>{canResend ? 'Resend code' : `Resend in ${countdown}s`}</span>
        </button>
      </div>
    </div>
  );
}

export default OtpVerificationModal;
