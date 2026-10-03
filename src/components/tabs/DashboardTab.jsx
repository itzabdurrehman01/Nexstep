import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Target, TrendingUp, Award, Briefcase,
  GraduationCap, ChevronRight, BarChart3, Mic,
  FileText, Bot, ArrowRight, Circle, CheckCircle2,
  AlertTriangle, Clock, CalendarDays, UserCheck,
  BookOpen, Rocket, ClipboardCheck, Search,
  Lightbulb, PlayCircle, DollarSign, Users
} from 'lucide-react';
import { translations }          from '../../data/translations.js';
import { DashboardSkeleton }      from '../common/Skeletons.jsx';
import { RecentActivityTimeline } from '../dashboard/RecentActivityTimeline.jsx';
import { rankAllCareers }         from '../../utils/careerMatchService.js';
import { computeRoadmapProgress, loadRoadmap } from '../../services/roadmapService.js';
import { ThreeDCareerGlobe }       from '../common/ThreeDCareerGlobe.jsx';

function ReadinessRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="140" height="140" aria-hidden="true" className="rotate-[-90deg]">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={col} stopOpacity="1" />
          <stop offset="100%" stopColor={col} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" strokeWidth="10"
        className="dashboard-ring-track" />
      <motion.circle cx="70" cy="70" r={r} fill="none" strokeWidth="10"
        stroke="url(#ringGrad)" strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }} />
    </svg>
  );
}

function FactorBar({ label, score, max, color = 'bg-emerald-500' }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{score}/{max}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function AnimatedCounter({ value, suffix = '' }) {
  return <span>{value}{suffix}</span>;
}

export function DashboardTab({ profile, onNavigate, lang }) {
  const t = translations[lang];
  const [loading]                        = useState(false);
  const [roadmapData, setRoadmapData]    = useState(null);
  const [interviews,  setInterviews]     = useState([]);

  const topCareer = useMemo(() => {
    if (!profile) return null;
    const ranked = rankAllCareers(profile);
    return ranked[0] ?? null;
  }, [profile]);

  const careerScore   = topCareer?.matchResult?.totalScore ?? 0;
  const missingSkills = topCareer?.matchResult?.explanation?.missingSkills ?? [];
  const matchingSkills = topCareer?.matchResult?.explanation?.matchingSkills ?? [];
  const skillMatchPct = topCareer?.matchResult?.explanation?.skillMatchPct ?? 0;
  const factors = topCareer?.matchResult?.factors ?? null;

  const profilePct = useMemo(() => {
    const checks = [
      profile?.name, profile?.city, profile?.preferredStream,
      profile?.topRiasecCluster, profile?.marks?.matricPct,
      profile?.marks?.fscPct,    profile?.targetCareer, profile?.goals,
      Array.isArray(profile?.skills) && profile.skills.length > 0,
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [profile]);

  const profileChecks = useMemo(() => ([
    { label: 'Full Name',         done: !!profile?.name },
    { label: 'City',              done: !!profile?.city },
    { label: 'Academic Stream',   done: !!profile?.preferredStream },
    { label: 'RIASEC Cluster',    done: !!profile?.topRiasecCluster },
    { label: 'Matric Marks',      done: !!profile?.marks?.matricPct },
    { label: 'FSc / Inter Marks', done: !!profile?.marks?.fscPct },
    { label: 'Skills List',       done: Array.isArray(profile?.skills) && profile.skills.length > 0 },
    { label: 'Target Career',     done: !!profile?.targetCareer },
    { label: 'Goals & Vision',    done: !!profile?.goals },
  ]), [profile]);

  useEffect(() => {
    const saved = loadRoadmap();
    if (saved?.milestones) setRoadmapData(computeRoadmapProgress(saved.milestones));
  }, []);

  useEffect(() => {
    fetch('/api/interviews', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d?.data)) setInterviews(d.data.slice(0, 3)); })
      .catch(() => {});
  }, []);

  const readinessScore = Math.round(
    careerScore * 0.4 + profilePct * 0.3 + (roadmapData?.pct ?? 0) * 0.3
  );

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === 'ur' ? 'صبح بخیر' : 'Good morning';
    if (h < 17) return lang === 'ur' ? 'دوپہر بخیر' : 'Good afternoon';
    return lang === 'ur' ? 'شام بخیر' : 'Good evening';
  };

  const firstName = profile?.name?.split(' ')[0] || 'Student';

  const upcomingDeadlines = [
    { title: 'MDCAT Registration', date: 'Aug 25, 2026', days: 15, tag: 'urgent' },
    { title: 'HEC Scholarship', date: 'Sep 10, 2026', days: 31, tag: 'scholarship' },
    { title: 'NUST Entry Test', date: 'Sep 20, 2026', days: 41, tag: 'test' },
  ];

  const recommendedActions = [
    {
      icon: Lightbulb, iconBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
      title: 'Take RIASEC Personality Test',
      desc: profile?.topRiasecCluster ? 'Refine your results and unlock deeper insights' : 'Discover your perfect career fit in 5 minutes',
      tab: 'quiz', cta: 'Start Now',
      done: !!profile?.topRiasecCluster,
    },
    {
      icon: FileText, iconBg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      title: 'Build Your Professional Resume',
      desc: 'Create a polished CV with our AI resume builder',
      tab: 'resume', cta: 'Build Resume',
      done: false,
    },
    {
      icon: GraduationCap, iconBg: 'bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400',
      title: 'Browse Top Scholarships',
      desc: '50+ scholarships matching your profile — worth exploring',
      tab: 'scholarships', cta: 'Explore',
      done: false,
    },
    {
      icon: Mic, iconBg: 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
      title: 'Practice 1 Mock Interview',
      desc: interviews.length > 0 ? 'Build on your last score and improve' : 'Get AI-powered feedback on your interview skills',
      tab: 'mockInterview', cta: 'Start Interview',
      done: false,
    },
    {
      icon: Search, iconBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      title: 'Explore Career Options',
      desc: topCareer ? `See 5+ careers similar to ${topCareer.title.split(' ').slice(0, 2).join(' ')}` : 'Discover top careers matching your profile',
      tab: 'careerAi', cta: 'Browse Careers',
      done: false,
    },
  ];

  const readinessLabel = readinessScore >= 70 ? 'Career-Ready' : readinessScore >= 40 ? 'On Track' : 'Getting Started';
  const readinessNote = readinessScore >= 70
    ? 'Strong profile — focus on skill mastery and roadmap execution.'
    : readinessScore >= 40
      ? 'Good foundation — complete your profile and build your roadmap.'
      : 'Start by completing your profile to unlock personalized guidance.';

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-8">

      {/* ── Hero Section ── */}
      <motion.div variants={item}
        className="dashboard-hero relative overflow-hidden rounded-3xl border shadow-2xl"
        style={undefined}>
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[22rem] h-[22rem] rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full bg-emerald-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-10">
            <div className="space-y-5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 dark:text-emerald-400 text-xs font-extrabold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Career Intelligence Hub
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="dashboard-hero-sub text-sm font-bold tracking-wide">
                  {greet()}, <span className="text-emerald-500 dark:text-emerald-400">{firstName}</span>
                </h2>
                <h1 className="dashboard-hero-title text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
                  Your career journey, <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400 bg-clip-text text-transparent">clearly mapped</span>.
                </h1>
                <p className="dashboard-hero-body text-sm sm:text-base leading-relaxed mt-3">
                  {profile?.preferredStream
                    ? `${profile.preferredStream} · ${profile?.city || 'Pakistan'} · ${readinessLabel.toLowerCase()}`
                    : 'Complete your profile to unlock personalized career guidance and AI-powered recommendations.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => onNavigate('aiChatbot')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 cursor-pointer transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                  <Bot className="w-4.5 h-4.5" aria-hidden="true" />
                  Ask AI Counselor
                </button>
                {profilePct < 80 && (
                  <button onClick={() => onNavigate('onboarding')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl dashboard-hero-btn-secondary font-bold text-sm cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                    <Target className="w-4 h-4 text-amber-500 dark:text-amber-300" aria-hidden="true" />
                    Complete Profile · {profilePct}%
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center shrink-0 gap-6">
              {/* Interactive 3D WebGL Globe Canvas */}
              <div className="hidden sm:block w-72 h-72 relative rounded-2xl overflow-hidden bg-slate-950/40 border border-emerald-500/20 shadow-xl backdrop-blur-sm">
                <ThreeDCareerGlobe height={280} />
              </div>

              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center" aria-label={`Career readiness score: ${readinessScore} out of 100`}>
                  <ReadinessRing score={readinessScore} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="dashboard-hero-score text-5xl sm:text-6xl font-black leading-none">
                      {readinessScore}
                    </span>
                    <span className="dashboard-hero-score-label text-[10px] font-bold uppercase tracking-widest mt-1">/ 100 READINESS</span>
                  </div>
                </div>
                <div className="mt-4 text-center space-y-1 max-w-xs">
                  <p className="text-sm font-extrabold dashboard-hero-label">{readinessLabel}</p>
                  <p className="text-xs dashboard-hero-note leading-relaxed">{readinessNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label: 'Career Match', value: careerScore, suffix: '%',
            sub: topCareer?.title?.split(' ').slice(0, 3).join(' ') ?? 'Analysis ready',
            icon: Sparkles,
            iconBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            valueColor: 'text-emerald-600 dark:text-emerald-400',
            tab: 'careerAi',
          },
          {
            label: 'Profile Completion', value: profilePct, suffix: '%',
            sub: profilePct >= 80 ? 'Excellent setup' : `${profileChecks.filter(c => c.done).length} of ${profileChecks.length} fields`,
            icon: Target,
            iconBg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            valueColor: profilePct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400',
            tab: 'onboarding',
          },
          {
            label: 'Roadmap Progress', value: roadmapData?.pct ?? 0, suffix: '%',
            sub: roadmapData ? `${roadmapData.doneTasks}/${roadmapData.totalTasks} tasks` : 'Build your roadmap',
            icon: TrendingUp,
            iconBg: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            valueColor: 'text-blue-600 dark:text-blue-400',
            tab: 'careerRoadmap',
          },
          {
            label: 'Skill Match', value: topCareer ? skillMatchPct : 0, suffix: '%',
            sub: `${missingSkills.length} skill${missingSkills.length === 1 ? '' : 's'} to develop`,
            icon: Award,
            iconBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
            valueColor: 'text-purple-600 dark:text-purple-400',
            tab: 'skillGap',
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} variants={item}
              onClick={() => onNavigate(s.tab)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNavigate(s.tab)}
              className="ns-card ns-card-hover p-5 flex flex-col gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${s.iconBg}`}>
                  <Icon className="w-5.5 h-5.5" aria-hidden="true" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                <div className={`text-2xl sm:text-3xl font-black tracking-tight ${s.valueColor}`}>
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pt-0.5">{s.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Main 2/3 + 1/3 Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">

          {/* Top Career Match */}
          {topCareer && (
            <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Top Career Match</h2>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {topCareer.title}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                        {careerScore}% Match
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                        <DollarSign className="w-3.5 h-3.5" />
                        PKR {topCareer.avgSalaryPkrMonth?.toLocaleString()}/mo
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {topCareer.growthDemand || 'Moderate Demand'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        Market Opportunity
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why this matches — factors */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Why This Matches</h4>
                {factors && (
                  <div className="space-y-3">
                    <FactorBar label="RIASEC / Interest Alignment" score={factors.riasecScore ?? 0} max={30} color="bg-gradient-to-r from-purple-500 to-purple-400" />
                    <FactorBar label="Academic Stream Compatibility" score={factors.streamScore ?? 0} max={25} color="bg-gradient-to-r from-blue-500 to-blue-400" />
                    <FactorBar label="Skills Already Possessed" score={factors.skillsScore ?? 0} max={25} color="bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    <FactorBar label="Academic Performance" score={factors.marksScore ?? 0} max={10} color="bg-gradient-to-r from-amber-500 to-amber-400" />
                    <FactorBar label="Market Demand Bonus" score={factors.demandScore ?? 0} max={10} color="bg-gradient-to-r from-teal-500 to-teal-400" />
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
                  <h5 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Matching Skills
                  </h5>
                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchingSkills.slice(0, 6).map((sk, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {sk}
                        </span>
                      ))}
                      {matchingSkills.length > 6 && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 self-center font-bold">+{matchingSkills.length - 6} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-700/70 dark:text-emerald-300/60 italic">Build your skills list to see matches.</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
                  <h5 className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Skills to Develop
                  </h5>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.slice(0, 6).map((sk, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {sk}
                        </span>
                      ))}
                      {missingSkills.length > 6 && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 self-center font-bold">+{missingSkills.length - 6} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-800/70 dark:text-amber-300/60 italic font-semibold">No critical skill gaps detected.</p>
                  )}
                </div>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {[
                  ['careerAi',      'Full Analysis',      'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20'],
                  ['careerRoadmap', 'Build Roadmap',      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'],
                  ['skillGap',      'Skill Gap Analysis', 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'],
                ].map(([tab, lbl, cls]) => (
                  <button key={tab} onClick={() => onNavigate(tab)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${cls}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Roadmap Progress */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                  <Rocket className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Career Roadmap Progress</h2>
              </div>
              <button onClick={() => onNavigate('careerRoadmap')}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
                View full <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {roadmapData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      {roadmapData.doneTasks} of {roadmapData.totalTasks} tasks complete
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{roadmapData.pct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={roadmapData.pct} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-500 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${roadmapData.pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }} />
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Upcoming Tasks</p>
                  <div className="space-y-2">
                    {roadmapData.upcomingTasks?.slice(0, 3).map((task, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-0.5">{task.text}</span>
                      </div>
                    ))}
                    {(!roadmapData.upcomingTasks || roadmapData.upcomingTasks.length === 0) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic px-3">All tasks complete — great progress!</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-blue-500" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No roadmap started yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">Build a step-by-step personalized roadmap to your dream career.</p>
                </div>
                <button onClick={() => onNavigate('careerRoadmap')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <Rocket className="w-4 h-4" aria-hidden="true" /> Start your career roadmap
                </button>
              </div>
            )}
          </motion.div>

          {/* Recommended Next Actions */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center">
                <Lightbulb className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Recommended Next Actions</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Personalized steps to advance your career journey</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendedActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <div key={i}
                    onClick={() => onNavigate(action.tab)}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && onNavigate(action.tab)}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 cursor-pointer transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.iconBg}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{action.title}</h3>
                        {action.done && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{action.desc}</p>
                    </div>
                    <div className="shrink-0 self-center flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                      {action.cta}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-5 sm:space-y-6">

          {/* Profile Completion Checklist */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                  <UserCheck className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Completion</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {profileChecks.filter(c => c.done).length} of {profileChecks.length} complete
                  </p>
                </div>
              </div>
              <span className={`text-lg font-black ${profilePct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                {profilePct}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${profilePct >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                initial={{ width: 0 }} animate={{ width: `${profilePct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <div className="space-y-2 pt-1">
              {profileChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  {check.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" aria-hidden="true" />
                  )}
                  <span className={check.done ? 'text-slate-600 dark:text-slate-400 font-medium' : 'text-slate-500 dark:text-slate-500 font-medium'}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => onNavigate('onboarding')}
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold cursor-pointer transition-all border border-slate-200 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
              <Target className="w-3.5 h-3.5" /> Continue onboarding
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <PlayCircle className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Quick Actions</h2>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Practice Interview', icon: Mic,          col: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/60',   tab: 'mockInterview' },
                { label: 'Update Resume',      icon: FileText,     col: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60',       tab: 'resume'        },
                { label: 'Browse Jobs',        icon: Briefcase,    col: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60',     tab: 'jobs'          },
                { label: 'Find Scholarship',   icon: GraduationCap,col: 'text-teal-600 dark:text-teal-400',   bg: 'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/60',       tab: 'scholarships'  },
                { label: 'View Analytics',     icon: BarChart3,    col: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60', tab: 'analytics' },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <button key={i} onClick={() => onNavigate(a.tab)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl ${a.bg} cursor-pointer transition-all text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.bg} ${a.col}`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className={`text-xs font-bold ${a.col} flex-1`}>{a.label}</span>
                    <ChevronRight className={`w-4 h-4 ${a.col} opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Interview Scores */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  <Mic className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Interviews</h2>
              </div>
              <button onClick={() => onNavigate('analytics')}
                className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer focus:outline-none">
                All
              </button>
            </div>

            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((iv, i) => {
                  const score = Number(iv.overallScore) || 0;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[140px]">
                          {iv.category || 'General'}
                        </span>
                        <span className={`text-sm font-black ${score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : score >= 40 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500'}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="flex gap-0.5 items-end h-7">
                        {[60, 45, 70, 55, 80, score].map((v, bi) => (
                          <motion.div
                            key={bi}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(10, v * 0.35)}px` }}
                            transition={{ duration: 0.5, delay: bi * 0.08, ease: 'easeOut' }}
                            className={`flex-1 rounded-sm ${bi === 5 ? (score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-200 dark:bg-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => onNavigate('mockInterview')}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-extrabold cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50">
                  <PlayCircle className="w-3.5 h-3.5" /> Practice again
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                  <Mic className="w-7 h-7 text-purple-500 opacity-60" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No interviews yet</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">AI interviews with real-time feedback to help you prepare.</p>
                </div>
                <button onClick={() => onNavigate('mockInterview')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-purple-500/20 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                  <Mic className="w-3.5 h-3.5" /> Start Mock Interview
                </button>
              </div>
            )}
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                <CalendarDays className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Upcoming Deadlines</h2>
            </div>
            <div className="space-y-2.5">
              {upcomingDeadlines.map((dl, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className={`w-1.5 h-12 rounded-full shrink-0 ${dl.tag === 'urgent' ? 'bg-red-500' : dl.tag === 'scholarship' ? 'bg-teal-500' : 'bg-indigo-500'}`} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{dl.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> {dl.date}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                    dl.days <= 15
                      ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {dl.days}d
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Timeline */}
          <motion.div variants={item} className="ns-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
            </div>
            <RecentActivityTimeline lang={lang} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
