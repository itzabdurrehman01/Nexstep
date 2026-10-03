import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket, Sparkles, Target, Compass, BookOpen, ShieldCheck,
  CheckCircle2, ArrowLeft, Users, GraduationCap, Lock, Award
} from 'lucide-react';
import { Login } from '../auth/Login.jsx';
import { Register } from '../auth/Register.jsx';
import { ForgotPassword } from '../auth/ForgotPassword.jsx';
import { ResetPassword } from '../auth/ResetPassword.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const FEATURE_HIGHLIGHTS = [
  {
    icon: Target,
    title: 'AI Career Matcher',
    desc: 'Matches your Matric/FSC marks and interests to 150+ high-demand careers in Pakistan and abroad.',
    badge: 'Pakistani Market Aligned',
    gradient: 'from-emerald-500/25 to-teal-500/25',
    iconColor: 'text-emerald-300',
    ringColor: 'ring-emerald-500/40',
  },
  {
    icon: Compass,
    title: 'Intelligent Roadmaps',
    desc: 'Step-by-step milestones from Matric through NUST, FAST, LUMS, GIKI, or IBA to your first job.',
    badge: '100+ Universities',
    gradient: 'from-blue-500/25 to-cyan-500/25',
    iconColor: 'text-cyan-300',
    ringColor: 'ring-cyan-500/40',
  },
  {
    icon: BookOpen,
    title: 'Scholarships & Merit Calc',
    desc: 'HEC, PEEF, Ehsaas & merit calculators calibrated for top Pakistani institutions.',
    badge: 'Verified Funding',
    gradient: 'from-violet-500/25 to-fuchsia-500/25',
    iconColor: 'text-violet-300',
    ringColor: 'ring-violet-500/40',
  },
];

export function AuthTab({ initialView, onAuthenticated, onNavigate, lang = 'en' }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { authStatus, user } = useAuth();

  const getInitialView = () => {
    if (initialView) return initialView;
    const path = location.pathname.toLowerCase();
    if (path.includes('register') || path.includes('signup')) return 'register';
    if (path.includes('forgot')) return 'forgot';
    if (path.includes('reset')) return 'reset';
    const mode = searchParams.get('mode') || searchParams.get('tab');
    if (mode === 'register' || mode === 'signup') return 'register';
    if (mode === 'forgot') return 'forgot';
    if (mode === 'reset') return 'reset';
    return 'login';
  };

  const [view, setView] = useState(getInitialView);
  const resetToken = searchParams.get('token') || '';

  useEffect(() => {
    const next = getInitialView();
    setView(next);
  }, [location.pathname, searchParams]);

  const returnTo = location.state?.from || 'dashboard';

  useEffect(() => {
    if (authStatus === 'authenticated') {
      // Role-aware: Mentor → /portal/mentor, Recruiter → /portal/recruiter, etc.
      const role = String(user?.role ?? user?.userRole ?? 'STUDENT').trim().toUpperCase();
      let dest = returnTo && returnTo !== '/' ? returnTo : null;
      if (!dest) {
        if (role === 'MENTOR')    dest = '/portal/mentor';
        else if (role === 'RECRUITER') dest = '/portal/recruiter';
        else if (role === 'ADMIN')     dest = '/portal/admin';
        else                           dest = '/dashboard';
      }
      navigate(dest, { replace: true });
    }
  }, [authStatus, returnTo, navigate]);

  if (authStatus === 'loading') {
    return (
      <div className="max-w-md mx-auto py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-emerald-600 dark:text-emerald-500 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Verifying session...</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Securing your NexStep connection</p>
        </div>
      </div>
    );
  }

  const getRoleHome = (user) => {
    const role = String(user?.role ?? user?.userRole ?? 'STUDENT').trim().toUpperCase();
    if (role === 'MENTOR')    return 'mentorPortal';
    if (role === 'RECRUITER') return 'recruiterPortal';
    if (role === 'ADMIN')     return 'adminPanel';
    return 'dashboard'; // STUDENT default
  };

  const handleLoginSuccess = (user) => {
    if (onAuthenticated) onAuthenticated(user);
    // Role-aware redirect: Mentor → mentor portal, Recruiter → recruiter portal, etc.
    const roleHome = getRoleHome(user);
    if (onNavigate) onNavigate(roleHome);
  };

  const handleRegisterSuccess = (user) => {
    if (onAuthenticated) onAuthenticated(user);
    // All new users see the role-aware portal selector first
    // RolePortalSelector then decides where to send them based on role
    if (onNavigate) onNavigate('roleSelect');
  };

  const isUrdu = lang === 'ur';

  const heroContent = {
    login: {
      badge: isUrdu ? 'واپسی پر خوش آمدید' : 'Welcome Back',
      title: isUrdu ? 'اپنے خوابوں کے کیریئر کا سفر جاری رکھیں' : 'Continue your journey to a dream career.',
      highlight: isUrdu ? 'پاکستان کا نمبر 1 رہنماء' : 'in Pakistan.',
      desc: isUrdu
        ? 'اپنے ذاتی ڈیش بورڈ پر لاگ ان کریں اور کیریئر کی درست ترین رہنمائی حاصل کریں۔'
        : 'Sign in to access your AI roadmap, track missing skill gaps, and discover verified Pakistani scholarships and job opportunities.',
    },
    register: {
      badge: isUrdu ? 'مفت اکاؤنٹ بنائیں' : 'Join NexStep Free',
      title: isUrdu ? 'مستقبل کا شاندار کیریئر بنائیں' : 'Build your career future with AI guidance.',
      highlight: isUrdu ? 'طلبہ، اساتذہ اور اداروں کے لیے' : 'Tailored for Pakistan.',
      desc: isUrdu
        ? '25,000 سے زائد طلبہ کے ساتھ شامل ہوں۔ میٹرک، ایف ایس سی اور یونیورسٹی کے لیے سمارٹ رہنمائی۔'
        : 'Join 25,000+ Pakistani learners, mentors, and recruiters. Get personalized roadmaps from Matric & FSC to graduation and your first job offer.',
    },
    forgot: {
      badge: isUrdu ? 'محفوظ اکاؤنٹ ریکوری' : 'Secure Recovery',
      title: isUrdu ? 'اپنا پاس ورڈ ری سیٹ کریں' : 'Reset your password securely.',
      highlight: isUrdu ? 'محفوظ لنک کے ذریعے' : 'Fast & encrypted.',
      desc: isUrdu
        ? 'اپنا رجسٹرڈ ای میل درج کریں۔ ہم آپ کو پاس ورڈ ری سیٹ کرنے کے لیے محفوظ لنک بھیجیں گے۔'
        : 'Enter your registered email address. We will send you an encrypted single-use link to create a new password within 15 minutes.',
    },
    reset: {
      badge: isUrdu ? 'نیا پاس ورڈ' : 'Set New Password',
      title: isUrdu ? 'ایک مضبوط پاس ورڈ منتخب کریں' : 'Create a strong, secure password.',
      highlight: isUrdu ? 'مکمل تحفظ' : 'Protected credentials.',
      desc: isUrdu
        ? 'کم از کم 8 حروف، ایک بڑا حرف اور ایک عدد شامل کریں۔'
        : 'Choose a strong password with at least 8 characters, an uppercase letter, and a number to keep your account safe.',
    },
  }[view] || {
    badge: 'NexStep AI',
    title: 'Your Next Step, Guided by AI',
    highlight: 'Career Navigation',
    desc: 'Pakistan’s premier AI career guidance and academic pathway platform.',
  };

  return (
    <div className={`w-full max-w-6xl mx-auto py-2 sm:py-6 lg:py-8 px-2 sm:px-4 ${isUrdu ? 'font-urdu' : ''}`}>
      {/* Outer Card Shell with Crisp High-Contrast Border */}
      <div className="relative rounded-3xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-emerald-950/20 overflow-hidden min-h-[660px] flex flex-col lg:flex-row">
        
        {/* Glow Accents */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" aria-hidden="true" />

        {/* ── Left Column: Brand & Feature Showcase (Always Rich Obsidian/Emerald with Explicit Bright White Text) ── */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 flex-col justify-between p-8 xl:p-11 bg-slate-950 text-white relative overflow-hidden border-r border-slate-800 z-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

          {/* Top: Logo & Platform Identity */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-400/30 ring-2 ring-white/30 font-black">
              <Rocket className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight !text-white flex items-center gap-2">
                <span className="!text-white">NexStep</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 !text-emerald-300 border border-emerald-400/40">
                  AI
                </span>
              </div>
              <div className="text-[11px] font-bold !text-slate-300">
                {isUrdu ? 'پاکستان کا تعلیمی و کیریئر نیویگیٹر' : 'Pakistan’s AI Career & Education Navigator'}
              </div>
            </div>
          </div>

          {/* Middle: Dynamic Value Proposition */}
          <div className="relative z-10 my-8 space-y-6">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 !text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 !text-emerald-300" />
                <span className="!text-emerald-300">{heroContent.badge}</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-[1.12] !text-white">
                <span className="!text-white">{heroContent.title}</span>{' '}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent block mt-1">
                  {heroContent.highlight}
                </span>
              </h1>
              <p className="text-xs sm:text-sm !text-slate-200 font-medium leading-relaxed max-w-sm">
                {heroContent.desc}
              </p>
            </motion.div>

            {/* Feature Cards with High Contrast */}
            <div className="space-y-3 pt-2">
              {FEATURE_HIGHLIGHTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/15 transition-all duration-300 flex items-start gap-3.5 group"
                  >
                    <div className={`w-9 h-9 rounded-xl ${item.gradient} ring-1 ${item.ringColor} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black !text-white group-hover:!text-emerald-300 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-bold !text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] !text-slate-200 font-medium leading-snug mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Social Proof & Metrics */}
          <div className="relative z-10 pt-5 border-t border-white/15 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Student"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full ring-2 ring-slate-900 object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="text-xs font-black !text-white flex items-center gap-1.5">
                    <span className="!text-white">25,000+ Students</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-bold !text-slate-300">Across 100+ Pakistani campuses</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black !text-emerald-300">94%</span>
                <div className="text-[10px] font-bold !text-slate-300">Clarity Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Dynamic Form Panel (Pristine Light/Dark with Clear High Contrast) ── */}
        <div className="w-full lg:w-7/12 xl:w-7/12 p-6 sm:p-9 xl:p-12 flex flex-col justify-between relative z-10 bg-slate-50/90 dark:bg-slate-950/60">
          
          {/* Top Bar: Nav Tabs (Login / Register) OR Back Link */}
          <div className="mb-6 flex items-center justify-between gap-4">
            {view === 'forgot' || view === 'reset' ? (
              <button
                type="button"
                onClick={() => setView('login')}
                className="inline-flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer py-2 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isUrdu ? 'سائن اِن کی طرف واپس جائیں' : 'Back to Sign In'}</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto inline-flex p-1 rounded-2xl bg-slate-200/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    view === 'login'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {isUrdu ? 'سائن اِن' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    view === 'register'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Account'}
                </button>
              </div>
            )}

            {/* Mobile Brand indicator */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                <Rocket className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">NexStep</span>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Login
                    embedded={true}
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setView('register')}
                    onForgotPassword={() => setView('forgot')}
                    lang={lang}
                  />
                </motion.div>
              )}

              {view === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Register
                    embedded={true}
                    onRegisterSuccess={handleRegisterSuccess}
                    onSwitchToLogin={() => setView('login')}
                    lang={lang}
                  />
                </motion.div>
              )}

              {view === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                >
                  <ForgotPassword
                    embedded={true}
                    onBackToLogin={() => setView('login')}
                    lang={lang}
                  />
                </motion.div>
              )}

              {view === 'reset' && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                >
                  <ResetPassword
                    embedded={true}
                    token={resetToken}
                    onBackToLogin={() => setView('login')}
                    onResetSuccess={() => setView('login')}
                    lang={lang}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Security Footer with High Contrast */}
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isUrdu ? '256 بٹ ٹی ایل ایس اینکرپٹڈ سیکیورٹی' : '256-bit TLS encrypted & HttpOnly secure cookies'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isUrdu ? 'ایچ ای سی اور پی ای سی ہم آہنگ' : 'HEC & PEC Aligned'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthTab;
