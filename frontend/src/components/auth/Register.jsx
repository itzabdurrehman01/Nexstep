import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  User, Mail, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, ShieldCheck, Sparkles, GraduationCap, Briefcase, Users,
  Check, Lock, BookOpen, School, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { OtpVerificationModal } from './OtpVerificationModal.jsx';
import { SocialDetailsModal } from './SocialDetailsModal.jsx';

const ROLE_OPTIONS = [
  {
    value: 'STUDENT',
    label: 'Student',
    urduLabel: 'طالب علم',
    icon: GraduationCap,
    desc: 'Degrees, admissions & roadmaps',
    urduDesc: 'ڈگریاں، داخلے اور تعلیمی روڈ میپ',
  },
  {
    value: 'MENTOR',
    label: 'Mentor / Faculty',
    urduLabel: 'استاد / مشیر',
    icon: Users,
    desc: 'Guide learners & hold 1-on-1s',
    urduDesc: 'طلبہ کی رہنمائی اور سیشنز',
  },
  {
    value: 'RECRUITER',
    label: 'Recruiter',
    urduLabel: 'ادارہ / ہائرنگ',
    icon: Briefcase,
    desc: 'Hire vetted Pakistani talent',
    urduDesc: 'بہترین گریجویٹس کی تلاش',
  },
];

// Education levels for students — drives which section of the portal they land in
const STUDENT_LEVELS = [
  {
    value: 'Grade 8 (Middle School)',
    label: 'Grade 8',
    urduLabel: '8 ویں جماعت',
    icon: BookOpen,
    desc: 'Middle school — stream selection guidance',
    urduDesc: 'مڈل اسکول — گروپ کا انتخاب',
    badge: '8th',
  },
  {
    value: 'Matric / O-Levels (9-10)',
    label: 'Matric / 9-10',
    urduLabel: 'میٹرک / 9-10',
    icon: School,
    desc: 'Secondary school — board exam prep',
    urduDesc: 'ثانوی تعلیم — بورڈ امتحان',
    badge: '9-10',
  },
  {
    value: 'FSc / Inter (11-12)',
    label: 'FSc / College',
    urduLabel: 'انٹرمیڈیٹ / کالج',
    icon: GraduationCap,
    desc: 'Intermediate — entry tests & admissions',
    urduDesc: 'انٹر — انٹری ٹیسٹ و داخلے',
    badge: '11-12',
  },
  {
    value: 'Undergraduate (BS / University)',
    label: 'University',
    urduLabel: 'یونیورسٹی',
    icon: Building2,
    desc: 'BS/BBA — career & skills roadmap',
    urduDesc: 'بی ایس — کیریئر روڈ میپ',
    badge: 'BS',
  },
];

function PasswordStrengthMeter({ password, isUrdu }) {
  const checks = [
    { label: isUrdu ? '8+ حروف' : '8+ chars', ok: password.length >= 8 },
    { label: isUrdu ? 'بڑا حرف' : 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: isUrdu ? 'نمبر' : 'Number', ok: /[0-9]/.test(password) },
    { label: isUrdu ? 'خصوصی علامت' : 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.ok).length;
  const colors = [
    'bg-slate-200 dark:bg-slate-700',
    'bg-red-500',
    'bg-amber-500',
    'bg-teal-500',
    'bg-emerald-500',
  ];
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
      {/* 4 segmented bars */}
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

      {/* Checklist items with Strong Contrast */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex flex-wrap gap-2.5">
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

export function Register({
  onRegisterSuccess,
  onSwitchToLogin,
  lang = 'en',
  embedded = false,
}) {
  const { login } = useAuth();
  const isUrdu = lang === 'ur';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [gradeLevel, setGradeLevel] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [requireOtp, setRequireOtp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [socialPending, setSocialPending] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');

  const validateEmail = (val) => {
    const clean = (val || '').toLowerCase().trim();
    if (!clean) return isUrdu ? 'ای میل ایڈریس ضروری ہے' : 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return isUrdu ? 'درست ای میل ایڈریس درج کریں' : 'Please enter a valid email address.';
    }
    return '';
  };

  const validateForm = () => {
    const errs = {
      firstName: !firstName.trim() ? (isUrdu ? 'پہلا نام ضروری ہے' : 'First name is required.') : '',
      lastName: !lastName.trim() ? (isUrdu ? 'آخری نام ضروری ہے' : 'Last name is required.') : '',
      email: validateEmail(email),
      password:
        password.length < 8
          ? isUrdu
            ? 'پاس ورڈ کم از کم 8 حروف پر مشتمل ہونا چاہیے'
            : 'Password must be at least 8 characters.'
          : '',
      confirmPassword:
        password !== confirmPassword
          ? isUrdu
            ? 'پاس ورڈز مطابقت نہیں رکھتے'
            : 'Passwords do not match.'
          : '',
      terms: !agreeTerms ? (isUrdu ? 'شرائط قبول کرنا ضروری ہے' : 'You must accept the terms to continue.') : '',
    };
    setFieldErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    if (requireOtp) {
      try {
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.toLowerCase().trim(), purpose: 'REGISTER' }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to send OTP verification code.');
          return;
        }

        if (data.devOtpCode) setDevOtpCode(data.devOtpCode);
        setIsVerifyingOtp(true);
      } catch {
        setError('Unable to send verification code. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Direct register without OTP
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password,
          confirmPassword,
          role,
          gradeLevel: role === 'STUDENT' ? gradeLevel : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      login(data.user);
      setSuccess(isUrdu ? `اکاؤنٹ بن گیا! خوش آمدید، ${data.user.firstName}!` : `Account created! Welcome to NexStep, ${data.user.firstName}!`);
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess(data.user);
      }, 500);
    } catch {
      setError('Unable to reach server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerified = async ({ verificationToken, otpCode }) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password,
          confirmPassword,
          role,
          gradeLevel: role === 'STUDENT' ? gradeLevel : undefined,
          verificationToken,
          otpCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setIsVerifyingOtp(false);
        return;
      }

      login(data.user);
      setSuccess(isUrdu ? `اکاؤنٹ تصدیق ہو گیا! خوش آمدید، ${data.user.firstName}!` : `Account verified! Welcome to NexStep AI, ${data.user.firstName}!`);

      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess(data.user);
      }, 600);
    } catch {
      setError('Registration failed during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const urlRes  = await fetch('/api/auth/google/url');
      const urlData = await urlRes.json();
      if (urlRes.ok && urlData.url && urlData.configured) {
        window.location.href = urlData.url;
        return;
      }
      setGoogleLoading(false);
      setSocialPending('google');
    } catch {
      setGoogleLoading(false);
      setSocialPending('google');
    }
  };

  const handleGithubSignUp = () => {
    setError('');
    setSocialPending('github');
  };

  const handleSocialModalConfirm = async ({ firstName: fn, lastName: ln, email: em }) => {
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
          profile: { email: em, firstName: fn, lastName: ln, avatarUrl: null, id: `${provider}_${Date.now()}` },
        }),
      });
      const socialData = await socialRes.json();
      if (!socialRes.ok) throw new Error(socialData.error || `${provider} signup failed.`);
      login(socialData.user);
      setSuccess(isUrdu ? `خوش آمدید، ${socialData.user.firstName}!` : `Welcome to NexStep, ${socialData.user.firstName}!`);
      setTimeout(() => { if (onRegisterSuccess) onRegisterSuccess(socialData.user); }, 500);
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
      setGithubLoading(false);
    }
  };

  const isBusy = isLoading || googleLoading || githubLoading;

  if (isVerifyingOtp) {
    return (
      <OtpVerificationModal
        email={email}
        purpose="REGISTER"
        initialDevCode={devOtpCode}
        onVerified={handleOtpVerified}
        onCancel={() => setIsVerifyingOtp(false)}
      />
    );
  }

  const formBody = (
    <div className="w-full space-y-5">
      {/* Title & Subtitle with Strong Contrast */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create Your Free Account'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
          {isUrdu
            ? 'پاکستان کے بہترین کیریئر اور تعلیمی پلیٹ فارم پر شمولیت اختیار کریں'
            : 'Join 25,000+ Pakistani students, mentors, and recruiters today.'}
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

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleGoogleSignUp}
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
          onClick={handleGithubSignUp}
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

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-slate-300 dark:border-slate-800 w-full" />
        <span className="bg-slate-50/90 dark:bg-slate-900 px-3 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0">
          {isUrdu ? 'یا ای میل کے ذریعے رجسٹر کریں' : 'or register with email'}
        </span>
      </div>

      {/* Role Selector Tiles with High Contrast in Light Mode */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-900 dark:text-slate-200">
          {isUrdu ? 'آپ کا کردار کیا ہے؟' : 'Select your profile type'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setRole(opt.value); if (opt.value !== 'STUDENT') setGradeLevel(''); }}
                className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'border-2 border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className={`text-xs font-black ${
                    isSelected ? 'text-emerald-950 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                  }`}>
                    {isUrdu ? opt.urduLabel : opt.label}
                  </div>
                  <div className={`text-[10px] font-medium leading-tight line-clamp-1 ${
                    isSelected ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {isUrdu ? opt.urduDesc : opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Education Level Selector — only for students */}
      {role === 'STUDENT' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5"
        >
          <label className="block text-xs font-black text-slate-900 dark:text-slate-200">
            {isUrdu ? 'آپ ابھی کس کلاس / درجے میں ہیں؟' : 'What is your current education level?'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STUDENT_LEVELS.map((lvl) => {
              const LvlIcon = lvl.icon;
              const isSelected = gradeLevel === lvl.value;
              return (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setGradeLevel(lvl.value)}
                  className={`p-2.5 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {lvl.badge}
                  </span>
                  <span className={`text-[11px] font-black leading-tight ${
                    isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {isUrdu ? lvl.urduLabel : lvl.label}
                  </span>
                  <span className={`text-[9px] font-medium leading-tight text-center ${
                    isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isUrdu ? lvl.urduDesc : lvl.desc}
                  </span>
                </button>
              );
            })}
          </div>
          {!gradeLevel && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isUrdu ? '(اختیاری — بعد میں پروفائل میں بدل سکتے ہیں)' : '(Optional — you can update this in your profile later)'}
            </p>
          )}
        </motion.div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleInitiateRegister} className="space-y-3.5" noValidate>
        {/* Name Fields (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="reg-first-name" className="block text-xs font-black text-slate-900 dark:text-slate-200">
              {isUrdu ? 'پہلا نام' : 'First Name'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="reg-first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName) setFieldErrors((p) => ({ ...p, firstName: '' }));
                }}
                placeholder={isUrdu ? 'احمد' : 'Ahmed'}
                disabled={isBusy}
                autoComplete="given-name"
                className={`w-full pl-10 pr-3 py-2.5 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                  fieldErrors.firstName
                    ? 'border-2 border-red-500 focus:border-red-600'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
            </div>
            {fieldErrors.firstName && (
              <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{fieldErrors.firstName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-last-name" className="block text-xs font-black text-slate-900 dark:text-slate-200">
              {isUrdu ? 'آخری نام' : 'Last Name'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                id="reg-last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (fieldErrors.lastName) setFieldErrors((p) => ({ ...p, lastName: '' }));
                }}
                placeholder={isUrdu ? 'خان' : 'Khan'}
                disabled={isBusy}
                autoComplete="family-name"
                className={`w-full pl-10 pr-3 py-2.5 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                  fieldErrors.lastName
                    ? 'border-2 border-red-500 focus:border-red-600'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
            </div>
            {fieldErrors.lastName && (
              <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="reg-email" className="block text-xs font-black text-slate-900 dark:text-slate-200">
            {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              id="reg-email"
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
              className={`w-full pl-10 pr-3 py-2.5 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                fieldErrors.email
                  ? 'border-2 border-red-500 focus:border-red-600'
                  : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="reg-pwd" className="block text-xs font-black text-slate-900 dark:text-slate-200">
            {isUrdu ? 'پاس ورڈ' : 'Password'}
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              id="reg-pwd"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
              }}
              placeholder={isUrdu ? 'کم از کم 8 حروف' : 'At least 8 characters'}
              disabled={isBusy}
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
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
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{fieldErrors.password}</p>
          )}
          <PasswordStrengthMeter password={password} isUrdu={isUrdu} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label htmlFor="reg-confirm-pwd" className="block text-xs font-black text-slate-900 dark:text-slate-200">
            {isUrdu ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              id="reg-confirm-pwd"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              placeholder={isUrdu ? 'دوبارہ پاس ورڈ درج کریں' : 'Re-enter your password'}
              disabled={isBusy}
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-slate-950 dark:text-white text-xs sm:text-sm font-semibold outline-hidden transition-all bg-white dark:bg-slate-800/90 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/15 ${
                fieldErrors.confirmPassword
                  ? 'border-2 border-red-500 focus:border-red-600'
                  : confirmPassword && password === confirmPassword
                  ? 'border-2 border-emerald-600 focus:border-emerald-600'
                  : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600'
              }`}
            />
            {confirmPassword && password === confirmPassword && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
            )}
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* OTP Toggle Option with Strong Contrast */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={requireOtp}
            onChange={(e) => setRequireOtp(e.target.checked)}
            className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500/40 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isUrdu
              ? 'اکاؤنٹ بنانے سے پہلے 6 ہندسوں کے او ٹی پی کوڈ سے ای میل کی تصدیق کریں (تجویز کردہ)'
              : 'Verify email with 6-digit OTP code before signup (Recommended)'}
          </span>
        </label>

        {/* Terms Agreement */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (fieldErrors.terms) setFieldErrors((p) => ({ ...p, terms: '' }));
              }}
              className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500/40 cursor-pointer mt-0.5"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
              {isUrdu ? (
                <>میں نیکسٹ اسٹیپ کی <span className="text-emerald-700 dark:text-emerald-400 font-black">شرائط و ضوابط</span> اور <span className="text-emerald-700 dark:text-emerald-400 font-black">پرائیویسی پالیسی</span> سے متفق ہوں۔</>
              ) : (
                <>I agree to NexStep’s <span className="text-emerald-700 dark:text-emerald-400 font-black hover:underline">Terms of Service</span> and <span className="text-emerald-700 dark:text-emerald-400 font-black hover:underline">Privacy Policy</span>.</>
              )}
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{fieldErrors.terms}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>{isUrdu ? 'اکاؤنٹ تیار ہو رہا ہے...' : 'Creating Account...'}</span>
            </>
          ) : (
            <>
              <span>{isUrdu ? 'مفت اکاؤنٹ بنائیں' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login Callout */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
        <div className="min-w-0">
          <div className="text-xs font-black text-slate-950 dark:text-white">
            {isUrdu ? 'پہلے سے اکاؤنٹ موجود ہے؟' : 'Already have an account?'}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
            {isUrdu ? 'فوری سائن اِن کریں' : 'Sign in to access your dashboard'}
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          {isUrdu ? 'سائن اِن' : 'Sign In'}
        </button>
      </div>
    </div>
  );

  const modalNode = socialPending ? (
    <SocialDetailsModal
      provider={socialPending}
      onConfirm={handleSocialModalConfirm}
      onCancel={() => setSocialPending(null)}
    />
  ) : null;

  if (embedded) {
    return <>{modalNode}{formBody}</>;
  }

  // Standalone mode
  return (
    <>
      {modalNode}
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl">
          {formBody}
        </div>
      </div>
    </>
  );
}

export default Register;
