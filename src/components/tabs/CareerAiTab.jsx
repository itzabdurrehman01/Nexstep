import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, CheckCircle2, Target, Clock,
  ArrowRight, AlertCircle, Info, Loader2, RefreshCw,
  Lightbulb, Map, BookOpen, TrendingUp, Building2,
  GraduationCap, Calculator, Route, Zap, BarChart3
} from 'lucide-react';
import { rankAllCareers } from '../../utils/careerMatchService.js';

function scoreColor(score) {
  if (score >= 80) return 'text-emerald-700 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-slate-500 dark:text-slate-400';
}
function scoreBg(score) {
  if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  if (score >= 60) return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}
function factorColor(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 75) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-slate-500';
}

function FactorBar({ label, score, max, color }) {
  const pct = Math.round((score / max) * 100);
  const barColor = color || factorColor(score, max);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{score}/{max}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>
    </div>
  );
}

function SkeletonLines({ lines = 4 }) {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="ns-skeleton h-3"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function CareerAiTab({ profile, onNavigate }) {
  const rankedCareers = useMemo(() => rankAllCareers(profile ?? {}), [profile]);

  const [selectedCareer, setSelectedCareer] = useState(rankedCareers[0]);
  const [compareCareerId, setCompareCareerId] = useState(rankedCareers[1]?.id ?? rankedCareers[0]?.id);
  const [activeSubTab, setActiveSubTab] = useState('recommendations');

  const compareCareer = useMemo(
    () => rankedCareers.find(c => c.id === compareCareerId) ?? rankedCareers[1],
    [rankedCareers, compareCareerId]
  );

  const selectedMatch = selectedCareer?.matchResult;
  const compareMatch  = compareCareer?.matchResult;

  const [aiAdvice, setAiAdvice]       = useState({});
  const [aiLoading, setAiLoading]     = useState({});
  const [aiError, setAiError]         = useState({});

  const fetchAiAdvice = useCallback(async (career, matchResult) => {
    const id = career.id;
    if (aiLoading[id] || aiAdvice[id]) return;

    setAiLoading(prev => ({ ...prev, [id]: true }));
    setAiError(prev => ({ ...prev, [id]: null }));
    try {
      const res = await fetch('/api/career/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerId:    career.id,
          careerTitle: career.title,
          matchScore:  matchResult.totalScore,
          factors:     matchResult.factors,
          explanation: matchResult.explanation,
          profile,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setAiAdvice(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      setAiError(prev => ({ ...prev, [id]: err.message || 'AI explanation failed.' }));
    } finally {
      setAiLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [aiLoading, aiAdvice, profile]);

  const currentAdvice  = aiAdvice[selectedCareer?.id]  ?? null;
  const currentLoading = aiLoading[selectedCareer?.id] ?? false;
  const currentError   = aiError[selectedCareer?.id]   ?? null;

  const salarySortedCareers = useMemo(
    () => [...rankedCareers].sort((a, b) =>
      (b.avgSalaryPkrMonth || 0) - (a.avgSalaryPkrMonth || 0)
    ),
    [rankedCareers]
  );
  const maxSalary = salarySortedCareers[0]?.avgSalaryPkrMonth || 1;

  const headerSubtitle = useMemo(() => {
    const parts = [];
    if (profile?.name) parts.push(profile.name);
    if (profile?.stream) parts.push(`Stream: ${profile.stream}`);
    if (profile?.preferredStream && profile.preferredStream !== profile.stream) {
      parts.push(`Prefers: ${profile.preferredStream}`);
    }
    if (profile?.riasecCluster) parts.push(`RIASEC: ${profile.riasecCluster}`);
    return parts.length > 0 ? parts.join(' · ') : 'Complete your profile for personalized matches';
  }, [profile]);

  const tabMeta = {
    recommendations: { label: 'Matches', icon: Sparkles },
    compare: { label: 'Compare', icon: BarChart3 },
    salary: { label: 'Salary Market', icon: TrendingUp },
  };

  return (
    <div className="space-y-6">
      {/* ── PREMIUM HEADER CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl"
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 80%, #059669 0%, transparent 50%)' }}
        />
        <div className="relative p-6 md:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <Sparkles className="w-7 h-7 stroke-[2.2]" />
              </motion.div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                    AI Career Recommendation Engine
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Baseline Hybrid Ranker v1.0
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 font-medium">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-1.5 bg-slate-800/70 backdrop-blur p-1.5 rounded-2xl text-xs font-semibold border border-slate-700/60"
            >
              {Object.entries(tabMeta).map(([key, { label, icon: Icon }]) => {
                const isActive = activeSubTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSubTab(key)}
                    className={`px-3.5 py-2 rounded-xl transition-all duration-300 capitalize flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── SUB-TAB 1: RECOMMENDATIONS ── */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'recommendations' && (
          <motion.div
            key="recs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* ── LEFT COLUMN: Career list ── */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1.5">
                Ranked Career Matches
              </h2>
              <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1.5 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                {rankedCareers.map((career, idx) => {
                  const score = career.matchResult.totalScore;
                  const isSelected = selectedCareer?.id === career.id;
                  return (
                    <motion.div
                      key={career.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.35 }}
                      onClick={() => setSelectedCareer(career)}
                      className={`ns-card ns-card-hover p-4 rounded-2xl cursor-pointer space-y-2.5 transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-emerald-500/40 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                            {career.title}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
                            {career.streamRequired}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full border font-extrabold text-[10px] shrink-0 ${scoreBg(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                        <span className="tabular-nums">PKR {career.avgSalaryPkrMonth?.toLocaleString()}/mo</span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate">
                          {career.growthDemand?.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ delay: 0.3 + idx * 0.04, duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Career detail ── */}
            <div className="lg:col-span-2 space-y-5">
              {selectedMatch && (
                <>
                  {/* ── MATCH HEADER CARD ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="ns-card rounded-3xl p-6 md:p-7 space-y-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full border font-extrabold text-xs ${scoreBg(selectedMatch.totalScore)}`}>
                            <span className="text-sm mr-1">{selectedMatch.totalScore}%</span>
                            Match
                          </span>
                          <span className="ns-badge ns-badge-neutral">
                            <span className="tracking-wide">{selectedCareer.riasecCode}</span>
                          </span>
                          <span className="ns-badge ns-badge-success flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {selectedCareer.growthDemand?.split(' ')[0] || 'High'} Growth
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                          {selectedCareer.title}
                        </h2>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Starting Monthly
                        </div>
                        <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          PKR {selectedCareer.avgSalaryPkrMonth?.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          Senior: <span className="text-slate-700 dark:text-slate-300 font-bold tabular-nums">PKR {selectedCareer.avgSalaryPkrSenior?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedCareer.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Required Stream
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {selectedCareer.streamRequired}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          Market Demand (2026–2030)
                        </div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {selectedCareer.growthDemand}
                        </div>
                      </div>
                    </div>

                    {/* ── FACTORS BREAKDOWN ── */}
                    <div className="space-y-3 pt-1">
                      <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Match Breakdown
                      </h4>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50/80 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-200 dark:border-slate-700/50 space-y-4">
                        <FactorBar label="RIASEC / Interest Alignment" score={selectedMatch.factors.riasecScore} max={30} />
                        <FactorBar label="Stream Fit" score={selectedMatch.factors.streamScore} max={25} />
                        <FactorBar label="Skills Possessed" score={selectedMatch.factors.skillsScore} max={25} />
                        <FactorBar label="Academic Performance" score={selectedMatch.factors.marksScore} max={10} />
                        <FactorBar label="Market Demand" score={selectedMatch.factors.demandScore} max={10} />
                      </div>
                    </div>

                    {/* ── SKILLS REQUIRED ── */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Skills Required
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            You have
                          </span>
                          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-500">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Develop
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCareer.requiredSkills?.map((skill, idx) => {
                          const have = selectedMatch?.explanation?.matchingSkills?.includes(skill) ?? false;
                          return (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 + idx * 0.03 }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                                have
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                              }`}
                            >
                              {have ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {skill}
                            </motion.span>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── TOP UNIVERSITIES ── */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Top Universities (Pakistan)
                    </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCareer.topUniversities?.map((uni, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors"
                          >
                            {uni}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ── CTA ROW ── */}
                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => onNavigate('fscMapper')}
                        className="ns-btn ns-btn-primary ns-btn-sm flex items-center gap-1.5"
                      >
                        <Calculator className="w-4 h-4" />
                        Entry Test Merit
                      </button>
                      <button className="ns-btn ns-btn-secondary ns-btn-sm flex items-center gap-1.5">
                        <Route className="w-4 h-4" />
                        Build Roadmap
                      </button>
                      <button className="ns-btn ns-btn-secondary ns-btn-sm flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        Skill Gap Analysis
                      </button>
                    </div>
                  </motion.div>

                  {/* ── AI EXPLANATION PANEL ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="ns-card rounded-3xl p-6 md:p-7 space-y-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                              AI Career Insight
                            </h3>
                            <span className="ns-badge ns-badge-ai text-[10px]">
                              Gemini Powered
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Personalized analysis for your unique profile
                          </p>
                        </div>
                      </div>
                      {currentAdvice && !currentLoading && (
                        <button
                          onClick={() => {
                            setAiAdvice(prev => ({ ...prev, [selectedCareer.id]: null }));
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
                          title="Regenerate AI advice"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* AI LOADING STATE */}
                    {currentLoading && (
                      <div className="relative p-5 rounded-2xl border border-violet-200/60 dark:border-violet-800/30 bg-violet-50/40 dark:bg-violet-950/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative">
                            <Loader2 className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-spin" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-violet-900 dark:text-violet-300">
                            Generating personalized advice…
                            </div>
                            <div className="text-[11px] text-violet-700/80 dark:text-violet-400/80 font-medium">
                            Gemini is analyzing your profile against this career
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="ns-skeleton h-4 rounded-lg w-full" />
                          <div className="ns-skeleton h-3 rounded-lg w-11/12" />
                          <div className="ns-skeleton h-3 rounded-lg w-10/12" />
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="space-y-2">
                              <div className="ns-skeleton h-3 rounded-lg" />
                              <div className="ns-skeleton h-3 rounded-lg w-5/6" />
                              <div className="ns-skeleton h-3 rounded-lg w-4/6" />
                            </div>
                            <div className="space-y-2">
                              <div className="ns-skeleton h-3 rounded-lg" />
                              <div className="ns-skeleton h-3 rounded-lg w-5/6" />
                              <div className="ns-skeleton h-3 rounded-lg w-4/6" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI ERROR STATE - Graceful */}
                    {currentError && !currentLoading && (
                      <div className="ns-alert ns-alert-warning flex-col sm:flex-row sm:items-start gap-3 p-5">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div className="font-extrabold text-sm">AI Advice Temporarily Unavailable</div>
                          <p className="text-xs leading-relaxed opacity-90">
                            Gemini AI is not configured right now. Your rule-based match above is fully active and accurate.
                            This often means the backend AI service needs an API key or is rate-limited. The match score,
                            factors, and skill analysis you see are calculated locally and are always trustworthy.
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => fetchAiAdvice(selectedCareer, selectedMatch)}
                              className="ns-btn ns-btn-sm ns-btn-secondary flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Retry AI
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTA STATE - Not yet generated */}
                    {!currentAdvice && !currentLoading && !currentError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-6 md:p-8 rounded-2xl border-2 border-dashed border-violet-300/60 dark:border-violet-700/40 bg-gradient-to-br from-violet-50/60 via-white to-violet-50/30 dark:from-violet-950/20 dark:via-slate-900/40 dark:to-violet-950/10 text-center space-y-4"
                      >
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">
                            Unlock AI-Powered Career Guidance
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                            Get personalized strengths, development areas, Pakistan-specific next steps,
                            and alternative careers — generated by Gemini for your exact profile.
                          </p>
                        </div>
                        <button
                          onClick={() => fetchAiAdvice(selectedCareer, selectedMatch)}
                          className="ns-btn ns-btn-lg inline-flex items-center gap-2 font-extrabold shadow-lg shadow-violet-500/20"
                          style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                            borderColor: '#7c3aed',
                          }}
                        >
                          <Sparkles className="w-5 h-5" />
                          Generate AI Advice
                        </button>
                      </motion.div>
                    )}

                    {/* AI ADVICE CONTENT */}
                    <AnimatePresence>
                      {currentAdvice && !currentLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-4"
                        >
                          {currentAdvice.whyThisCareer && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 }}
                              className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/40 dark:from-violet-950/30 dark:to-purple-950/10 border border-violet-200/70 dark:border-violet-800/40"
                            >
                              <div className="flex items-center gap-2 mb-2.5">
                                <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                  <Lightbulb className="w-4 h-4" />
                                </div>
                                <h5 className="text-xs font-extrabold text-violet-900 dark:text-violet-300 uppercase tracking-wider">
                                  Why This Career Fits You
                                </h5>
                              </div>
                              <p className="text-sm text-violet-900/90 dark:text-violet-200/90 leading-relaxed font-medium">
                                {currentAdvice.whyThisCareer}
                              </p>
                            </motion.div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.isArray(currentAdvice.personalStrengths) && currentAdvice.personalStrengths.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 space-y-3"
                              >
                                <h5 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Personal Strengths
                                </h5>
                                <ul className="space-y-2">
                                  {currentAdvice.personalStrengths.map((pt, i) => (
                                    <li key={i} className="text-xs text-emerald-900/90 dark:text-emerald-200/90 flex items-start gap-2 font-medium leading-relaxed">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}

                            {Array.isArray(currentAdvice.developmentAreas) && currentAdvice.developmentAreas.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 space-y-3"
                              >
                                <h5 className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <Target className="w-4 h-4" />
                                  Development Areas
                                </h5>
                                <ul className="space-y-2">
                                  {currentAdvice.developmentAreas.map((pt, i) => (
                                    <li key={i} className="text-xs text-amber-900/90 dark:text-amber-200/90 flex items-start gap-2 font-medium leading-relaxed">
                                      <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </div>

                          {Array.isArray(currentAdvice.nextSteps) && currentAdvice.nextSteps.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/40 space-y-3"
                            >
                              <h5 className="text-xs font-extrabold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Map className="w-4 h-4" />
                                Next Steps
                              </h5>
                              <ol className="space-y-2.5">
                                {currentAdvice.nextSteps.map((s, i) => (
                                  <li key={i} className="text-xs text-blue-900/90 dark:text-blue-200/90 flex items-start gap-3 font-medium leading-relaxed">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] shrink-0">
                                      {i + 1}
                                    </span>
                                    <span className="pt-0.5">{s}</span>
                                  </li>
                                ))}
                              </ol>
                            </motion.div>
                          )}

                          {Array.isArray(currentAdvice.alternativeCareers) && currentAdvice.alternativeCareers.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 }}
                              className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/40 space-y-3"
                            >
                              <h5 className="text-xs font-extrabold text-teal-900 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" />
                                Alternative Careers to Explore
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {currentAdvice.alternativeCareers.map((c, i) => (
                                  <span
                                    key={i}
                                    className="ns-badge ns-badge-info text-xs cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                      const found = rankedCareers.find(rc => rc.title.toLowerCase().includes(c.toLowerCase()));
                                      if (found) setSelectedCareer(found);
                                    }}
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {currentAdvice.pakistanSpecificAdvice && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-emerald-50/70 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-emerald-950/25 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3"
                            >
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <BookOpen className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                                  🇵🇰 Pakistan-Specific Advice
                                </h5>
                                <p className="text-sm text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed font-medium">
                                  {currentAdvice.pakistanSpecificAdvice}
                                </p>
                              </div>
                            </motion.div>
                          )}

                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            {currentAdvice.estimatedTimeToEntry && (
                              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
                                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  Est. Time to Entry: <span className="text-slate-900 dark:text-white">{currentAdvice.estimatedTimeToEntry}</span>
                                </span>
                              </div>
                            )}
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic font-medium">
                              Generated by Gemini AI · Rule-based match above is always authoritative
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── SUB-TAB 2: COMPARE ── */}
        {activeSubTab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <div className="ns-card rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Side-by-Side Career Comparison
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Evaluate two careers against your profile to make an informed decision
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                <label className="font-bold text-slate-600 dark:text-slate-400 shrink-0">Compare with:</label>
                <select
                  value={compareCareerId}
                  onChange={(e) => setCompareCareerId(e.target.value)}
                  className="ns-select !py-2 !text-xs !font-bold flex-1 sm:w-64"
                >
                  {rankedCareers.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.matchResult?.totalScore ?? 0}%)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { career: selectedCareer, match: selectedMatch, accent: 'emerald', delay: 0 },
                { career: compareCareer, match: compareMatch, accent: 'amber', delay: 0.08 },
              ].map(({ career, match, accent, delay }) => (
                <motion.div
                  key={career?.id || Math.random()}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.4 }}
                  className={`ns-card rounded-3xl p-6 space-y-5 border-l-4 ${
                    accent === 'emerald'
                      ? 'border-l-emerald-500'
                      : 'border-l-amber-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">
                        {career?.title}
                      </h3>
                      <span className={`ns-badge ns-badge-${accent} text-sm px-3 py-1`}>
                        {match?.totalScore ?? '—'}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {career?.riasecCode} · {career?.streamRequired}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Starting</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                        PKR {career?.avgSalaryPkrMonth?.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Senior</div>
                      <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        PKR {career?.avgSalaryPkrSenior?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Match Factors
                    </div>
                    <div className="space-y-2">
                      <FactorBar label="RIASEC" score={match?.factors?.riasecScore ?? 0} max={30} />
                      <FactorBar label="Stream" score={match?.factors?.streamScore ?? 0} max={25} />
                      <FactorBar label="Skills" score={match?.factors?.skillsScore ?? 0} max={25} />
                      <FactorBar label="Marks" score={match?.factors?.marksScore ?? 0} max={10} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Skills Required
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {career?.requiredSkills?.slice(0, 6).map((s, i) => {
                        const have = match?.explanation?.matchingSkills?.includes(s);
                        return (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                              have
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                            }`}
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Summary
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {match?.explanation?.whySummary}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SUB-TAB 3: SALARY ── */}
        {activeSubTab === 'salary' && (
          <motion.div
            key="salary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="ns-card rounded-3xl p-6 md:p-7 space-y-5"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Salary Market Overview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Pakistani industry salary trajectory 2026–2030 · Sorted by average starting salary
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  Senior
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500/40" />
                  Starting
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {salarySortedCareers.map((career, idx) => {
                const startPct = ((career.avgSalaryPkrMonth || 0) / maxSalary) * 100;
                const seniorPct = ((career.avgSalaryPkrSenior || 0) / (maxSalary * 2.5)) * 100;
                return (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.35 }}
                    onClick={() => { setSelectedCareer(career); setActiveSubTab('recommendations'); }}
                    className="ns-card ns-card-hover p-4 md:p-5 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="md:w-64 shrink-0 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug truncate">
                            {career.title}
                          </h3>
                          <span className={`ns-badge ns-badge-neutral text-[10px] shrink-0 ${scoreBg(career.matchResult.totalScore)} !border-0`}>
                            {career.matchResult.totalScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <span>{career.streamRequired}</span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            {career.growthDemand?.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-20 shrink-0 tabular-nums">
                            Start
                          </span>
                          <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${startPct}%` }}
                              transition={{ delay: 0.3 + idx * 0.05, duration: 0.7, ease: 'easeOut' }}
                              className="h-full bg-emerald-500/50 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28 text-right tabular-nums shrink-0">
                            PKR {career.avgSalaryPkrMonth?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-20 shrink-0 tabular-nums">
                            Senior
                          </span>
                          <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${seniorPct}%` }}
                              transition={{ delay: 0.4 + idx * 0.05, duration: 0.7, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 w-28 text-right tabular-nums shrink-0">
                            PKR {career.avgSalaryPkrSenior?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-2 text-center">
              Click any card to jump to detailed match analysis · Salary estimates are PKR/month for Pakistan market
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
