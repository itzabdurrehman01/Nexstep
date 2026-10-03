import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  Bot, 
  Briefcase, 
  Grid, 
  X, 
  Search, 
  Vibrate, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Globe,
  Sliders,
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  Building2,
  GraduationCap,
  Users,
  Mic,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { translations } from '../data/translations.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Web Audio API Haptic Audio Sound Simulation Fallback for Desktop/Non-vibration browsers
const triggerAudioHaptic = (type = 'medium') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    
    if (type === 'soft') {
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } else if (type === 'strong') {
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    } else {
      // Medium default
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    }
  } catch (e) {
    // Audio Context blocked or unavailable
  }
};

export function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  lang = 'en', 
  setLang, 
  theme: themeProp, 
  setTheme: setThemeProp,
  onOpenCommandPalette,
  isMobileView = false
}) {
  const { theme: themeCtx, setTheme: setThemeCtx } = useTheme();
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const theme = themeProp || themeCtx;
  const setTheme = setThemeProp || setThemeCtx;

  const t = translations[lang] || translations.en;
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [hapticMode, setHapticMode] = useState('medium'); // 'soft', 'medium', 'strong', 'double'
  const [lastTappedTab, setLastTappedTab] = useState(null);
  const [ripplePos, setRipplePos] = useState({ id: null, x: 0, y: 0 });

  // Role-aware primary nav — each role gets its most-used tabs
  const primaryTabs =
    role === 'ADMIN' ? [
      { id: 'dashboard',   label: 'Home',     icon: Compass,     badge: null },
      { id: 'adminPanel',  label: 'Admin',    icon: ShieldCheck, badge: 'Admin' },
      { id: 'aiChatbot',   label: 'AI Chat',  icon: Bot,         isCenter: true, badge: 'Live' },
      { id: 'analytics',   label: 'Stats',    icon: BarChart3,   badge: null },
      { id: 'more',        label: 'More',     icon: Grid,        isMoreTrigger: true, badge: null },
    ] :
    role === 'MENTOR' ? [
      { id: 'mentorPortal',label: 'Sessions', icon: Users,       badge: null },
      { id: 'calendarNotif',label: 'Calendar',icon: Calendar,    badge: null },
      { id: 'aiChatbot',   label: 'AI Chat',  icon: Bot,         isCenter: true, badge: 'Live' },
      { id: 'analytics',   label: 'Stats',    icon: BarChart3,   badge: null },
      { id: 'more',        label: 'More',     icon: Grid,        isMoreTrigger: true, badge: null },
    ] :
    role === 'RECRUITER' ? [
      { id: 'recruiterPortal',label: 'Portal',icon: Building2,   badge: null },
      { id: 'jobs',        label: 'Jobs',     icon: Briefcase,   badge: null },
      { id: 'aiChatbot',   label: 'AI Chat',  icon: Bot,         isCenter: true, badge: 'Live' },
      { id: 'analytics',   label: 'Stats',    icon: BarChart3,   badge: null },
      { id: 'more',        label: 'More',     icon: Grid,        isMoreTrigger: true, badge: null },
    ] :
    /* STUDENT default */ [
      { id: 'dashboard',   label: 'Home',     icon: Compass,     badge: null },
      { id: 'careerAi',    label: 'Career AI', icon: Sparkles,   badge: 'AI' },
      { id: 'aiChatbot',   label: 'AI Chat',  icon: Bot,         isCenter: true, badge: 'Live' },
      { id: 'jobs',        label: 'Jobs',     icon: Briefcase,   badge: null },
      { id: 'more',        label: 'More',     icon: Grid,        isMoreTrigger: true, badge: '30' },
    ];

  // All 30 Portal Modules for the More Drawer
  const allModules = [
    { id: 'dashboard', label: 'Student Portal Dashboard', category: 'Main Hub', icon: Compass },
    { id: 'careerAi', label: 'AI Career Recommendation', category: 'AI Intelligence', icon: Sparkles },
    { id: 'quiz', label: 'RIASEC Assessment Quiz', category: 'AI Intelligence', icon: Sparkles },
    { id: 'grade8Matric', label: 'Grade 8 & Matric Guidance', category: 'AI Intelligence', icon: BookOpen },
    { id: 'fscMapper', label: 'FSc Stream & Board Mapper', category: 'AI Intelligence', icon: Award },

    { id: 'resume', label: 'Resume Analyzer & ATS', category: 'Career Tools', icon: FileText },
    { id: 'skillGap', label: 'AI Skill Gap Analysis', category: 'Career Tools', icon: TrendingUp },
    { id: 'careerRoadmap', label: 'Career Roadmap Generator', category: 'Career Tools', icon: Compass },
    { id: 'courses', label: 'Courses & Certifications', category: 'Career Tools', icon: BookOpen },

    { id: 'universities', label: 'University Recommendation', category: 'Opportunities', icon: Building2 },
    { id: 'scholarships', label: 'Scholarship Portal', category: 'Opportunities', icon: GraduationCap },
    { id: 'jobs', label: 'Job & Internship Portal', category: 'Opportunities', icon: Briefcase },

    { id: 'mockInterview', label: 'AI Mock Interview', category: 'AI Assistants', icon: Mic },
    { id: 'voiceAssistant', label: 'Bilingual AI Voice Assistant', category: 'AI Assistants', icon: Mic, highlight: true },
    { id: 'aiChatbot', label: 'Gemini AI Counselor Chat', category: 'AI Assistants', icon: Bot, highlight: true },

    { id: 'community', label: 'Student Career Community', category: 'Network & Mentors', icon: Users },
    { id: 'mentorship', label: '1-on-1 Mentor Connect', category: 'Network & Mentors', icon: Users },
    { id: 'calendarNotif', label: 'Deadlines & Calendar', category: 'Network & Mentors', icon: Calendar },

    { id: 'analytics', label: 'Progress Analytics', category: 'System & Admin', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Upgrade', category: 'System & Admin', icon: Settings },
    { id: 'helpCenter', label: 'Help Desk & Support', category: 'System & Admin', icon: HelpCircle },
    { id: 'adminPanel', label: 'Admin Command Center', category: 'System & Admin', icon: ShieldCheck },
  ];

  const filteredModules = searchQuery.trim() === '' 
    ? allModules 
    : allModules.filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()));

  // Trigger Haptic Feedback (Vibration + Web Audio Fallback)
  const triggerHaptic = (e, tabId) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipplePos({ id: tabId, x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    
    setLastTappedTab(tabId);
    setTimeout(() => setLastTappedTab(null), 300);

    if (!hapticEnabled) return;

    // Device Physical Vibration API
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        if (hapticMode === 'soft') {
          navigator.vibrate(8);
        } else if (hapticMode === 'strong') {
          navigator.vibrate(25);
        } else if (hapticMode === 'double') {
          navigator.vibrate([10, 30, 15]);
        } else {
          navigator.vibrate(14); // Medium
        }
      } catch (err) {
        // Fallback or permission blocked
      }
    }

    // Audio Haptic Click Simulation
    triggerAudioHaptic(hapticMode);
  };

  const handleTabClick = (e, tab) => {
    triggerHaptic(e, tab.id);

    if (tab.isMoreTrigger) {
      setIsMoreOpen(true);
    } else {
      setActiveTab(tab.id);
      setIsMoreOpen(false);
    }
  };

  return (
    <>
      {/* Floating Bottom Navigation Dock for Mobile View */}
      <div className={`${isMobileView ? 'absolute' : 'fixed md:hidden'} bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none`}>
        <div className="max-w-md mx-auto pointer-events-auto">
          <nav className="relative flex items-center justify-around bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-3xl p-1.5 transition-all">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !isMoreOpen;
              const isCenter = tab.isCenter;
              const isTapped = lastTappedTab === tab.id;

              if (isCenter) {
                return (
                  <div key={tab.id} className="relative -top-5 flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.90 }}
                      onClick={(e) => handleTabClick(e, tab)}
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold cursor-pointer shadow-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 ring-4 ring-emerald-500/30 shadow-emerald-500/40'
                          : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 dark:from-emerald-600 dark:to-teal-700 shadow-slate-900/30'
                      }`}
                    >
                      {/* Ambient Pulse Halo */}
                      <span className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping pointer-events-none" />
                      
                      {/* Active Indicator Pulse Ring */}
                      {isTapped && (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 1 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="absolute inset-0 rounded-2xl bg-emerald-400/50 pointer-events-none"
                        />
                      )}

                      <motion.div
                        animate={isTapped ? { rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Bot className="w-7 h-7 text-white drop-shadow-md" />
                      </motion.div>

                      {/* AI Badge */}
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black tracking-widest shadow-xs">
                        AI
                      </span>
                    </motion.button>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">
                      {tab.label}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={(e) => handleTabClick(e, tab)}
                  className={`relative flex-1 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer select-none ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {/* Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavActiveIndicator"
                      className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}

                  {/* Tactile Tap Ripple */}
                  {ripplePos.id === tab.id && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="absolute w-6 h-6 rounded-full bg-emerald-400/40 pointer-events-none z-10"
                      style={{ left: ripplePos.x - 12, top: ripplePos.y - 12 }}
                    />
                  )}

                  {/* Tab Icon with Micro Animation */}
                  <motion.div
                    animate={
                      isActive 
                        ? { scale: [1, 1.22, 1], y: [0, -2, 0] } 
                        : isTapped 
                        ? { scale: [1, 0.85, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 0.25 }}
                    className="relative z-10"
                  >
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                    {tab.badge && (
                      <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-white text-[8px] font-black leading-none">
                        {tab.badge}
                      </span>
                    )}
                  </motion.div>

                  <span className="relative z-10 text-[10px] font-bold mt-1 tracking-tight leading-none">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* More Portals Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-md md:hidden">
            {/* Backdrop Dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="absolute inset-0"
            />

            {/* Bottom Sheet Modal Container */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-h-[85vh] overflow-y-auto space-y-4 z-10"
            >
              {/* Top Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">All 30 Portals</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Quick Launcher & Mobile Controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Haptic & Audio Settings Control Strip */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Haptic Feedback Simulation</span>
                      <span className="text-[10px] text-slate-500 font-medium">Vibration & Audio Tactile Pulse</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerAudioHaptic('strong');
                      setHapticEnabled(!hapticEnabled);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hapticEnabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {hapticEnabled ? 'ENABLED' : 'OFF'}
                  </button>
                </div>

                {hapticEnabled && (
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-500">Intensity:</span>
                    <div className="flex items-center gap-1">
                      {['soft', 'medium', 'strong', 'double'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setHapticMode(mode);
                            triggerHaptic(null, 'test');
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                            hapticMode === mode
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme & Language Quick Switches */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    triggerHaptic(null, 'theme');
                    setTheme && setTheme(theme === 'dark' ? 'light' : 'dark');
                  }}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    triggerHaptic(null, 'lang');
                    setLang && setLang(lang === 'en' ? 'ur' : 'en');
                  }}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      {lang === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>

              {/* Search Bar for Portals */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search 30 Portals (e.g. Scholarship, Resume, Quiz)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Portals List */}
              <div className="space-y-1.5 pt-1">
                {filteredModules.map((m) => {
                  const Icon = m.icon;
                  const isAct = activeTab === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={(e) => {
                        triggerHaptic(e, m.id);
                        setActiveTab(m.id);
                        setIsMoreOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-extrabold text-left transition-all cursor-pointer ${
                        isAct 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          isAct ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block leading-tight">{m.label}</span>
                          <span className={`text-[10px] font-semibold block ${isAct ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {m.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isAct ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileBottomNav;
