import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass, CheckCircle2, Circle, ArrowRight, Flag,
  RotateCcw, Target, Sparkles, TrendingUp, Map,
  ListChecks, LayoutGrid, Clock, ChevronRight,
  Briefcase, GraduationCap, School, BookOpen, Rocket,
  Zap, Award, Calendar, CheckSquare, Square
} from 'lucide-react';
import {
  loadRoadmapAsync, saveRoadmapAsync, resetRoadmapAsync,
  getDefaultMilestonesForCareer, getRoadmapCareerOptions, computeRoadmapProgress,
} from '../../services/roadmapService.js';
import { CAREERS_DATA } from '../../data/careersData.js';

const CAREER_TO_ROADMAP = {
  'car-1': 'car-1',
  'car-2': 'car-2',
  'car-3': 'car-3',
};

function getRoadmapId(careerId) {
  return CAREER_TO_ROADMAP[careerId] ?? 'default';
}

const CATEGORY_CONFIG = {
  foundation: {
    label: 'Foundation',
    dot: 'bg-blue-500',
    bar: 'from-blue-500 to-blue-400',
    ring: 'ring-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    icon: School,
  },
  intermediate: {
    label: 'Intermediate',
    dot: 'bg-emerald-500',
    bar: 'from-emerald-500 to-emerald-400',
    ring: 'ring-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    icon: BookOpen,
  },
  prep: {
    label: 'University Prep',
    dot: 'bg-violet-500',
    bar: 'from-violet-500 to-violet-400',
    ring: 'ring-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-900',
    icon: Target,
  },
  university: {
    label: 'University Degree',
    dot: 'bg-amber-500',
    bar: 'from-amber-500 to-amber-400',
    ring: 'ring-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    icon: GraduationCap,
  },
  professional: {
    label: 'Career Launch',
    dot: 'bg-teal-500',
    bar: 'from-teal-500 to-teal-400',
    ring: 'ring-teal-500',
    text: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-900',
    icon: Rocket,
  },
};

function categorizeMilestone(milestone) {
  const title = (milestone.title || '').toLowerCase();
  if (title.includes('matric') || title.includes('o-level') || title.includes('foundation') || title.includes('grade 9') || title.includes('grade 10')) return 'foundation';
  if (title.includes('fsc') || title.includes('ics') || title.includes('intermediate') || title.includes('grade 11') || title.includes('grade 12')) return 'intermediate';
  if (title.includes('entry test') || title.includes('mdcat') || title.includes('admission') || title.includes('prep')) return 'prep';
  if (title.includes('university') || title.includes('mbbs') || title.includes('bs ') || title.includes('degree') || title.includes('enrollment') || title.includes('clinical')) return 'university';
  return 'professional';
}

function ReadinessRing({ score, size = 120, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} aria-hidden="true" className="rotate-[-90deg] shrink-0">
      <defs>
        <linearGradient id="roadmapRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={col} stopOpacity="1" />
          <stop offset="100%" stopColor={col} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
        stroke="#1e293b" opacity="0.35" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
        stroke="url(#roadmapRingGrad)" strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.3, ease: 'easeOut' }} />
    </svg>
  );
}

function ProgressBar({ value, gradient = 'from-emerald-500 to-teal-400', height = 'h-2' }) {
  return (
    <div className={`ns-progress ${height}`}>
      <motion.div
        className={`ns-progress-bar bg-gradient-to-r ${gradient}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function MilestoneTimelineNode({ status, category, index }) {
  const cat = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.professional;
  return (
    <div className="relative flex flex-col items-center shrink-0 w-14">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
        className="relative z-10"
      >
        {status === 'completed' ? (
          <div className={`w-11 h-11 rounded-full ${cat.dot} flex items-center justify-center shadow-lg shadow-${cat.dot}/30 ring-4 ring-white dark:ring-slate-900`}>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        ) : status === 'current' ? (
          <div className="relative">
            <div className={`absolute inset-0 w-11 h-11 rounded-full ${cat.dot} opacity-20 animate-ping`} />
            <div className={`relative w-11 h-11 rounded-full ring-4 ${cat.ring} ring-opacity-30 bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg`}>
              <div className={`w-6 h-6 rounded-full ${cat.dot} flex items-center justify-center`}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-sm">
            <Circle className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ConnectorLine({ fromStatus, toStatus, category }) {
  const cat = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.professional;
  if (fromStatus === 'completed' && (toStatus === 'completed' || toStatus === 'current')) {
    return (
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className={`absolute left-1/2 -translate-x-1/2 top-11 w-0.5 ${cat.dot} bottom-0 z-0`}
      />
    );
  }
  if (fromStatus === 'current' || (fromStatus === 'completed' && toStatus === 'upcoming')) {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 top-11 w-0.5 bottom-0 z-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-emerald-400 via-amber-400 to-transparent opacity-60" />
      </div>
    );
  }
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-11 w-0.5 bottom-0 z-0 border-l-2 border-dashed border-slate-300 dark:border-slate-700" />
  );
}

function getTemplateSuggestion(profile) {
  const target = (profile?.targetCareer || '').toLowerCase();
  const stream = (profile?.preferredStream || '').toLowerCase();
  if (target.includes('med') || target.includes('doctor') || target.includes('mbbs') || target.includes('surg') || stream.includes('pre-med')) {
    return { id: 'car-2', label: 'Pre-Medical Roadmap', desc: 'MBBS journey: FSc Pre-Medical → MDCAT → Medical College → House Job → FCPS/MS', icon: GraduationCap };
  }
  if (target.includes('engin') || target.includes('civil') || target.includes('mech') || target.includes('electr') || stream.includes('pre-eng')) {
    return { id: 'car-1', label: 'Engineering Roadmap', desc: 'Engineering path: FSc Pre-Engineering → Entry Test → University → Internship → P.Eng', icon: Briefcase };
  }
  if (target.includes('soft') || target.includes('comput') || target.includes('ai') || target.includes('data') || target.includes('cyber') || target.includes('cs') || stream.includes('ics')) {
    return { id: 'car-1', label: 'CS / Software Engineering Roadmap', desc: 'Tech career: ICS → NET/NTS → BS CS/SE → Projects → Software / AI / Data Engineer role', icon: Rocket };
  }
  return { id: 'default', label: 'General Career Pathway', desc: 'Flexible roadmap: Foundation → Skill Building → Education → Career Entry', icon: Compass };
}

const VIEW_TABS = [
  { id: 'timeline', label: 'Timeline view', icon: Map },
  { id: 'checklist', label: 'Checklist view', icon: ListChecks },
  { id: 'overview', label: 'Overview stats', icon: LayoutGrid },
];

export function CareerRoadmapTab({ profile, onNavigate, lang }) {
  const [milestones, setMilestones] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState('car-1');
  const [activeView, setActiveView] = useState('timeline');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [justCompleted, setJustCompleted] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);

  const careerOptions = useMemo(() => getRoadmapCareerOptions(), []);

  useEffect(() => {
    (async () => {
      const saved = await loadRoadmapAsync();
      if (saved && saved.milestones && saved.milestones.length > 0) {
        setSelectedCareerId(saved.selectedCareerId ?? 'car-1');
        setMilestones(saved.milestones);
        setIsEmptyState(false);
      } else {
        setIsEmptyState(true);
        const profileTarget = profile?.targetCareer;
        const matchedCareer = CAREERS_DATA.find(c =>
          c.title === profileTarget || c.id === profileTarget
        );
        const initId = matchedCareer ? (CAREER_TO_ROADMAP[matchedCareer.id] ?? 'car-1') : 'car-1';
        setSelectedCareerId(initId);
      }
      setLoaded(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded || milestones.length === 0) return;
    saveRoadmapAsync({ selectedCareerId, milestones });
    setIsEmptyState(false);
  }, [milestones, selectedCareerId, loaded]);

  const progress = useMemo(() => computeRoadmapProgress(milestones), [milestones]);

  const handleCareerChange = useCallback((newCareerId) => {
    setSelectedCareerId(newCareerId);
    const fresh = getDefaultMilestonesForCareer(newCareerId);
    setMilestones(fresh);
    setShowResetConfirm(false);
  }, []);

  const generateRoadmap = useCallback((careerId) => {
    const fresh = getDefaultMilestonesForCareer(careerId);
    setSelectedCareerId(careerId);
    setMilestones(fresh);
    setIsEmptyState(false);
  }, []);

  const toggleTask = useCallback((milestoneId, taskId) => {
    setMilestones(prev => {
      const next = prev.map(m => {
        if (m.id !== milestoneId) return m;
        const newTasks = (m.tasks ?? []).map(t =>
          t.id === taskId ? { ...t, done: !t.done } : t
        );
        const allDone = newTasks.every(t => t.done);
        const anyDone = newTasks.some(t => t.done);
        let newStatus = m.status;
        if (allDone && m.status !== 'completed') newStatus = 'completed';
        else if (!allDone && m.status === 'completed') newStatus = 'current';
        return { ...m, tasks: newTasks, status: newStatus };
      });
      return next;
    });
    setJustCompleted(taskId);
    setTimeout(() => setJustCompleted(null), 1200);
  }, []);

  const handleReset = useCallback(() => {
    resetRoadmapAsync();
    setMilestones([]);
    setIsEmptyState(true);
    setShowResetConfirm(false);
  }, []);

  const templateSuggestion = useMemo(() => getTemplateSuggestion(profile), [profile]);

  const nextTask = useMemo(() => {
    for (const m of milestones) {
      const pending = (m.tasks ?? []).find(t => !t.done);
      if (pending) return { task: pending, milestone: m };
    }
    return null;
  }, [milestones]);

  const categorizedMilestones = useMemo(() =>
    milestones.map(m => ({ ...m, category: categorizeMilestone(m) }))
  , [milestones]);

  const estimatedTimeToNext = useMemo(() => {
    const current = milestones.find(m => m.status === 'current');
    if (!current) return null;
    const doneCount = (current.tasks ?? []).filter(t => t.done).length;
    const remaining = (current.tasks ?? []).length - doneCount;
    if (remaining === 0) return null;
    const weeksPerTask = 1.5;
    const totalWeeks = Math.ceil(remaining * weeksPerTask);
    if (totalWeeks >= 4) return `~${Math.ceil(totalWeeks / 4)} month${totalWeeks >= 8 ? 's' : ''}`;
    return `~${totalWeeks} week${totalWeeks > 1 ? 's' : ''}`;
  }, [milestones]);

  if (!loaded) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (isEmptyState || milestones.length === 0) {
    const SugIcon = templateSuggestion.icon;
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-xl border border-slate-700"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <Map className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Start Your Career Roadmap</h1>
            <p className="text-sm text-slate-300 max-w-md">
              A personalized step-by-step journey from where you are today to your dream career. Track milestones, complete tasks, and watch your progress grow.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="ns-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <SugIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Suggested for You</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on your profile</p>
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">{templateSuggestion.label}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{templateSuggestion.desc}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateRoadmap(templateSuggestion.id)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate This Roadmap
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="ns-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <ListChecks className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Browse Roadmaps</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose any track</p>
              </div>
            </div>
            <div className="space-y-2">
              {careerOptions.map(opt => (
                <motion.button
                  key={opt.id}
                  whileHover={{ x: 3 }}
                  onClick={() => generateRoadmap(opt.id)}
                  className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all text-left cursor-pointer group"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{opt.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 shrink-0 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-7 shadow-2xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-52 h-52 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-40 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/20 shrink-0">
                <Map className="w-7 h-7" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                  Career Roadmap
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {profile?.targetCareer ? (
                    <>Your guided path to becoming a <span className="text-emerald-400 font-semibold">{profile?.targetCareer}</span></>
                  ) : (
                    <>Track your journey from foundation to career launch</>
                  )}
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-slate-300">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    {progress.doneTasks}/{progress.totalTasks} tasks
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Auto-saved</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <div className="relative shrink-0">
                <ReadinessRing score={progress.pct} size={110} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white leading-none">{progress.pct}<span className="text-sm">%</span></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCareerId}
                  onChange={e => handleCareerChange(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-800/70 text-emerald-300 border border-slate-700 text-xs font-bold focus:outline-none cursor-pointer backdrop-blur"
                >
                  {careerOptions.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                  <option value="default">General Career Pathway</option>
                </select>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur"
                  title="Reset roadmap progress"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 pt-5 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3 text-xs"
              >
                <span className="text-slate-300 font-medium flex-1">Reset all progress and clear this roadmap?</span>
                <div className="flex gap-2">
                  <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-slate-200 font-bold cursor-pointer transition-all">
                    Cancel
                  </button>
                  <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer transition-all">
                    Yes, Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex gap-1.5 p-1 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur">
            {VIEW_TABS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeView === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 lg:grid-cols-[1fr_320px]"
          >
            <div className="space-y-2">
              {categorizedMilestones.map((m, idx) => {
                const cat = CATEGORY_CONFIG[m.category] ?? CATEGORY_CONFIG.professional;
                const doneTasks = (m.tasks ?? []).filter(t => t.done).length;
                const taskPct = (m.tasks ?? []).length > 0 ? Math.round((doneTasks / (m.tasks ?? []).length) * 100) : 0;
                const nextStatus = categorizedMilestones[idx + 1]?.status;
                const isLast = idx === categorizedMilestones.length - 1;
                const CatIcon = cat.icon;
                return (
                  <div key={m.id} className="relative">
                    {!isLast && (
                      <ConnectorLine
                        fromStatus={m.status}
                        toStatus={nextStatus}
                        category={m.category}
                      />
                    )}
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="relative z-10 flex gap-4"
                    >
                      <MilestoneTimelineNode status={m.status} category={m.category} index={idx} />
                      <div className="flex-1 pb-2 min-w-0">
                        <div className={`ns-card overflow-hidden ${m.status === 'current' ? 'ring-2 ring-emerald-400/30 shadow-lg' : ''}`}>
                          <div className={`px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 ${cat.bg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ${cat.dot} text-white shrink-0`}>
                                <CatIcon className="w-3.5 h-3.5" />
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${cat.text}`}>
                                {cat.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {doneTasks}/{(m.tasks ?? []).length}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                m.status === 'completed'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : m.status === 'current'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {m.status === 'current' ? 'Active' : m.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 space-y-4">
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-snug">
                                {m.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {m.period}
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                <span className={cat.text}>{taskPct}%</span>
                              </div>
                              <ProgressBar value={taskPct} gradient={cat.bar} />
                            </div>
                            <div className="space-y-2 pt-1">
                              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Action Items
                              </span>
                              {m.tasks.map(task => (
                                <motion.button
                                  key={task.id}
                                  layout
                                  onClick={() => toggleTask(m.id, task.id)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                                    task.done
                                      ? `${cat.bg} ${cat.border}`
                                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                                  } ${justCompleted === task.id ? 'ring-2 ring-emerald-400/60 scale-[1.015]' : ''}`}
                                >
                                  <motion.span
                                    layout
                                    whileTap={{ scale: 0.85 }}
                                    className="shrink-0"
                                  >
                                    {task.done ? (
                                      <CheckSquare className={`w-4.5 h-4.5 ${cat.text}`} />
                                    ) : (
                                      <Square className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
                                    )}
                                  </motion.span>
                                  <span className={`text-xs font-medium flex-1 leading-relaxed ${
                                    task.done
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}>
                                    {task.text}
                                  </span>
                                </motion.button>
                              ))}
                            </div>
                            {m.status === 'completed' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-1 p-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2"
                              >
                                <Award className="w-4 h-4 shrink-0" />
                                Milestone completed — excellent progress!
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 lg:sticky lg:top-4 self-start">
              <div className="ns-card p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Target className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Roadmap Progress</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {careerOptions.find(o => o.id === selectedCareerId)?.label ?? 'Career Pathway'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Overall</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{progress.pct}%</span>
                  </div>
                  <ProgressBar value={progress.pct} gradient="from-emerald-500 to-teal-400" height="h-2.5" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                      <span className="block text-lg font-black text-slate-900 dark:text-white leading-none">{progress.completedMilestones}</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Done</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                      <span className="block text-lg font-black text-slate-900 dark:text-white leading-none">{progress.totalMilestones}</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ns-card p-5 space-y-3.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Milestones Breakdown
                </h4>
                <div className="space-y-2.5">
                  {categorizedMilestones.map(m => {
                    const cat = CATEGORY_CONFIG[m.category] ?? CATEGORY_CONFIG.professional;
                    const done = (m.tasks ?? []).filter(t => t.done).length;
                    const pct = (m.tasks ?? []).length > 0 ? Math.round((done / (m.tasks ?? []).length) * 100) : 0;
                    return (
                      <div key={m.id} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cat.dot} shrink-0`} />
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{m.title}</span>
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 shrink-0">{pct}%</span>
                        </div>
                        <div className="pl-4">
                          <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${cat.bar} transition-all duration-700 ease-out`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {nextTask && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ns-card p-5 space-y-3 relative overflow-hidden ring-2 ring-amber-400/30 shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                      <Zap className="w-3 h-3" />
                      Focus Now
                    </span>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {nextTask.milestone.title}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {nextTask.task.text}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTask(nextTask.milestone.id, nextTask.task.id)}
                      className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Complete
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {estimatedTimeToNext && (
                <div className="ns-card p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Next Milestone</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    At your current pace, approximately <span className="font-bold text-teal-600 dark:text-teal-400">{estimatedTimeToNext}</span> to complete the active milestone tasks.
                  </p>
                </div>
              )}

              {progress.pct === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ns-card p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-900 space-y-3"
                >
                  <div className="text-3xl">🎓</div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">Roadmap Complete!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Prepare for your next step with our AI mock interview.
                  </p>
                  <button
                    onClick={() => onNavigate?.('mockInterview')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Practice Interview
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeView === 'checklist' && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="ns-card p-5 md:p-6 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 dark:text-white">Master Checklist</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {progress.doneTasks} of {progress.totalTasks} tasks complete
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-48">
                <ProgressBar value={progress.pct} gradient="from-emerald-500 to-teal-400" />
              </div>
            </div>

            <div className="space-y-6">
              {categorizedMilestones.map((m, idx) => {
                const cat = CATEGORY_CONFIG[m.category] ?? CATEGORY_CONFIG.professional;
                const done = (m.tasks ?? []).filter(t => t.done).length;
                const allDone = done === (m.tasks ?? []).length;
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${cat.dot} text-white shrink-0`}>
                        <CatIcon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                          {m.title}
                        </h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {m.period} · {done}/{m.tasks.length} tasks
                        </span>
                      </div>
                      {allDone && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>
                    <div className="grid gap-2 pl-11">
                      {m.tasks.map(task => (
                        <motion.button
                          key={task.id}
                          layout
                          onClick={() => toggleTask(m.id, task.id)}
                          whileTap={{ scale: 0.985 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                            task.done
                              ? `${cat.bg} ${cat.border}`
                              : 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
                          } ${justCompleted === task.id ? 'ring-2 ring-emerald-400/50' : ''}`}
                        >
                          <motion.span whileTap={{ scale: 0.85 }} className="shrink-0">
                            {task.done ? (
                              <CheckSquare className={`w-4.5 h-4.5 ${cat.text}`} />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                            )}
                          </motion.span>
                          <span className={`text-xs font-medium flex-1 ${
                            task.done
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {task.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="ns-card p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <ReadinessRing score={progress.pct} size={140} strokeWidth={12} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{progress.pct}<span className="text-lg">%</span></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Complete</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-4 w-full">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {careerOptions.find(o => o.id === selectedCareerId)?.label ?? 'Career Pathway'}
                  </h2>
                  {profile?.targetCareer && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Target role: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{profile?.targetCareer}</span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Tasks', val: progress.totalTasks, color: 'text-slate-900 dark:text-white', icon: ListChecks },
                    { label: 'Completed', val: progress.doneTasks, color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
                    { label: 'Remaining', val: progress.totalTasks - progress.doneTasks, color: 'text-amber-600 dark:text-amber-400', icon: Clock },
                    { label: 'Milestones', val: `${progress.completedMilestones}/${progress.totalMilestones}`, color: 'text-violet-600 dark:text-violet-400', icon: Flag },
                  ].map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <SIcon className={`w-3.5 h-3.5 ${s.color}`} />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="ns-card p-6 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Milestone Progression
                </h3>
                <div className="space-y-4">
                  {categorizedMilestones.map((m, idx) => {
                    const cat = CATEGORY_CONFIG[m.category] ?? CATEGORY_CONFIG.professional;
                    const done = (m.tasks ?? []).filter(t => t.done).length;
                    const pct = (m.tasks ?? []).length > 0 ? Math.round((done / (m.tasks ?? []).length) * 100) : 0;
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-3 h-3 rounded-full ${cat.dot} shrink-0 ring-4 ring-white dark:ring-slate-900`} />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{m.title}</span>
                          </div>
                          <span className={`text-[11px] font-black ${cat.text} shrink-0`}>{pct}%</span>
                        </div>
                        <ProgressBar value={pct} gradient={cat.bar} height="h-1.5" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <div className="ns-card p-6 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Next Recommended Step
                  </h3>
                  {nextTask ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {nextTask.milestone.title}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {nextTask.task.text}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleTask(nextTask.milestone.id, nextTask.task.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete This Task
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center py-4">
                      <div className="text-3xl">🎉</div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">All tasks complete!</p>
                    </div>
                  )}
                </div>

                <div className="ns-card p-6 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flag className="w-4 h-4 text-violet-500" />
                    Milestone Status
                  </h3>
                  <div className="space-y-2.5">
                    {['completed', 'current', 'upcoming'].map(status => {
                      const count = milestones.filter(m => m.status === status).length;
                      const config = {
                        completed: { dot: 'bg-emerald-500', label: 'Completed', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900' },
                        current:   { dot: 'bg-amber-500',   label: 'In Progress', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900' },
                        upcoming:  { dot: 'bg-slate-400',   label: 'Upcoming',    text: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-800/40',    border: 'border-slate-200 dark:border-slate-700' },
                      }[status];
                      return (
                        <div key={status} className={`flex items-center justify-between p-3 rounded-xl ${config.bg} border ${config.border}`}>
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                            <span className={`text-xs font-bold ${config.text}`}>{config.label}</span>
                          </div>
                          <span className={`text-sm font-black ${config.text}`}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {progress.pct < 100 && progress.upcomingTasks.length > 0 && (
                  <div className="ns-card p-6 space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      Upcoming Tasks
                    </h3>
                    <div className="space-y-2">
                      {progress.upcomingTasks.slice(0, 5).map((task, i) => (
                        <div key={task.id} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{task.text}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onNavigate?.('skillGap')}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer pt-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      View Skill Gap Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
