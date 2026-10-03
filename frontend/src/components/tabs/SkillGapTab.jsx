import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  ArrowRight, Filter, ArrowUpDown,
  BookOpen, GraduationCap, ExternalLink,
  Sparkles, Target, Award, Zap,
  Clock, BarChart3, ChevronRight,
  AlertCircle, CheckCircle2, TrendingUp,
  Gauge, Search, Layers
} from 'lucide-react';
import { CAREERS_DATA } from '../../data/careersData.js';
import { computeSkillGap, rankAllCareers } from '../../utils/careerMatchService.js';
import { COURSES_DATA } from '../../data/mockFullAppData.js';

const FILTER_TABS = [
  { key: 'all', label: 'All Skills', icon: null },
  { key: 'missing', label: 'Missing', icon: AlertCircle },
  { key: 'acquired', label: 'Acquired', icon: CheckCircle2 },
  { key: 'high', label: 'High Priority', icon: Target },
  { key: 'medium', label: 'Medium Priority', icon: Clock },
  { key: 'low', label: 'Low Priority', icon: Award },
];

const SORT_OPTIONS = [
  { key: 'priority', label: 'Priority' },
  { key: 'alpha', label: 'Alphabetical' },
  { key: 'gap', label: 'Gap %' },
  { key: 'difficulty', label: 'Difficulty' },
];

const DIFFICULTY_STYLE = {
  Advanced: 'ns-badge ns-badge-danger',
  Intermediate: 'ns-badge ns-badge-warning',
  Beginner: 'ns-badge ns-badge-success',
};

const DIFFICULTY_LABEL = {
  Advanced: 'HARD',
  Intermediate: 'MODERATE',
  Beginner: 'EASY',
};

const PRIORITY_LABEL = {
  High: 'HIGH',
  Medium: 'MEDIUM',
  Low: 'LOW',
};

const PRIORITY_BADGE = {
  High: 'ns-badge ns-badge-danger',
  Medium: 'ns-badge ns-badge-warning',
  Low: 'ns-badge ns-badge-success',
};

const PK_LEARNING_RESOURCES = [
  {
    name: 'DigiSkills.pk',
    desc: 'FREE Government of Pakistan e-learning with 10+ courses (Python, SEO, Freelancing)',
    badge: 'FREE',
    badgeClass: 'ns-badge ns-badge-success',
    link: 'https://digiskills.pk',
  },
  {
    name: 'NAVTTC',
    desc: 'National Vocational Training — free technical diplomas & CBT courses nationwide',
    badge: 'Gov PK',
    badgeClass: 'ns-badge ns-badge-warning',
    link: 'https://navttc.gov.pk',
  },
  {
    name: 'Google Career Certificates',
    desc: 'Coursera free access in PK — IT Support, PM, Data Analytics certificates',
    badge: 'Coursera PK',
    badgeClass: 'ns-badge ns-badge-primary',
    link: 'https://grow.google/certificates/',
  },
  {
    name: 'Coursera for Pakistan',
    desc: 'HEC-sponsored free access to premium university courses & specialisations',
    badge: 'HEC Partner',
    badgeClass: 'ns-badge ns-badge-info',
    link: 'https://www.coursera.org/pakistan',
  },
];

function getLearningRecommendation(skill) {
  const s = skill.toLowerCase();
  if (s.includes('python') || s.includes('machine learning') || s.includes('data')) {
    return { text: 'Take DigiSkills Python Bootcamp', provider: 'DigiSkills.pk' };
  }
  if (s.includes('react') || s.includes('node') || s.includes('sql') || s.includes('database')) {
    return { text: 'Enroll in Coursera Full-Stack Track', provider: 'Coursera / Meta' };
  }
  if (s.includes('git') || s.includes('version') || s.includes('cloud') || s.includes('aws') || s.includes('gcp')) {
    return { text: 'Practice on freeCodeCamp Labs', provider: 'freeCodeCamp' };
  }
  if (s.includes('figma') || s.includes('adobe') || s.includes('illustrator') || s.includes('photoshop') || s.includes('design') || s.includes('ux')) {
    return { text: 'Watch YouTube Figma Masterclass', provider: 'YouTube / Google' };
  }
  if (s.includes('biology') || s.includes('chemistry') || s.includes('physics') || s.includes('mdcat') || s.includes('anatomy') || s.includes('pharmacology')) {
    return { text: 'Join KIPS/STEP Online Prep', provider: 'KIPS Academy' };
  }
  if (s.includes('accounting') || s.includes('audit') || s.includes('tax') || s.includes('excel') || s.includes('finance') || s.includes('sap') || s.includes('erp')) {
    return { text: 'Start ACCA-X free modules', provider: 'ACCA Global' };
  }
  if (s.includes('calculus') || s.includes('math') || s.includes('statistics') || s.includes('algebra') || s.includes('probability')) {
    return { text: 'Practice with Khan Academy', provider: 'Khan Academy' };
  }
  if (s.includes('circuit') || s.includes('embedded') || s.includes('matlab') || s.includes('plc') || s.includes('electronics') || s.includes('pcb')) {
    return { text: 'Try NAVTTC Embedded Systems', provider: 'NAVTTC' };
  }
  if (s.includes('hvac') || s.includes('solar') || s.includes('safety') || s.includes('technical drawing') || s.includes('troubleshoot')) {
    return { text: 'Enroll TEVTA Trade Course', provider: 'TEVTA PK' };
  }
  return { text: 'Find matched courses in Courses Tab', provider: 'NexStep AI' };
}

function getProficiencyInfo(skillName, matchingSkills) {
  const match = matchingSkills.find(ms => {
    const n1 = ms.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n2 = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n1 === n2) return true;
    if (n1.length >= 4 && n2.includes(n1)) return true;
    if (n2.length >= 4 && n1.includes(n2)) return true;
    return false;
  });
  if (match) return { pct: 90, label: 'Proficient', color: 'bg-emerald-500' };
  const partial = matchingSkills.some(ms => {
    const n1 = ms.toLowerCase();
    const n2 = skillName.toLowerCase();
    return n1.split(/\s+/).some(w => w.length >= 4 && n2.includes(w))
        || n2.split(/\s+/).some(w => w.length >= 4 && n1.includes(w));
  });
  if (partial) return { pct: 40, label: 'Developing', color: 'bg-amber-500' };
  return { pct: 0, label: 'Beginner', color: 'bg-red-500' };
}

function AnimatedProgress({ value, color = 'bg-emerald-500', duration = 0.9 }) {
  return (
    <div className="ns-progress h-2.5">
      <motion.div
        className={`ns-progress-bar ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration, ease: 'easeOut' }}
      />
    </div>
  );
}

function StaggerWrap({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MatchRing({ score, size = 96, strokeWidth = 8 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, score)) / 100) * circ;
  const col = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const col2 = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#fca5a5';
  return (
    <div className="relative shrink-0" aria-hidden="true">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={`sgRingGrad-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={col} stopOpacity="1" />
            <stop offset="100%" stopColor={col2} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
          stroke="var(--ns-surface-3)" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
          stroke={`url(#sgRingGrad-${score})`} strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="ns-stat-value text-[color:var(--ns-text)]">{Math.round(score)}</span>
        <span className="text-[9px] font-extrabold text-[color:var(--ns-text-subtle)] uppercase tracking-[0.12em] mt-0.5">Match</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, tone, delay = 0 }) {
  const toneMap = {
    success: { icon: 'bg-[color:var(--ns-success-bg)] text-[color:var(--ns-success)]', num: 'text-[color:var(--ns-success)]' },
    danger: { icon: 'bg-[color:var(--ns-danger-bg)] text-[color:var(--ns-danger)]', num: 'text-[color:var(--ns-danger)]' },
    warning: { icon: 'bg-[color:var(--ns-warning-bg)] text-[color:var(--ns-warning)]', num: 'text-[color:var(--ns-warning)]' },
    info: { icon: 'bg-[color:var(--ns-info-bg)] text-[color:var(--ns-info)]', num: 'text-[color:var(--ns-info)]' },
    primary: { icon: 'bg-[color:var(--ns-primary-100)] text-[color:var(--ns-primary-700)] dark:bg-[color:var(--ns-primary-900)]/30 dark:text-[color:var(--ns-primary-400)]', num: 'text-[color:var(--ns-primary-700)] dark:text-[color:var(--ns-primary-400)]' },
  };
  const t = toneMap[tone] ?? toneMap.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className="ns-card p-4 sm:p-5 ns-card-hover"
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[color:var(--ns-text-subtle)] whitespace-nowrap">
            {label}
          </p>
          <p className={`ns-stat-value ${t.num}`}>{value}</p>
          {sub && <p className="text-[11px] text-[color:var(--ns-text-faint)] font-medium">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.icon}`}>
          {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
        </div>
      </div>
    </motion.div>
  );
}

function SkillCard({ entry, index, onNavigate }) {
  const gapColor = entry.gap <= 10 ? 'bg-emerald-500' : entry.gap <= 55 ? 'bg-amber-500' : 'bg-red-500';
  const gapTextCol = entry.gap <= 10 ? 'text-[color:var(--ns-success)]' : entry.gap <= 55 ? 'text-[color:var(--ns-warning)]' : 'text-[color:var(--ns-danger)]';
  const isMissing = !entry.isAcquired;
  const borderPrio = entry.priority === 'High' ? 'border-l-4 border-l-red-500'
    : entry.priority === 'Medium' ? 'border-l-4 border-l-amber-500'
    : 'border-l-4 border-l-emerald-500';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + index * 0.035 }}
      className={`ns-card ns-card-hover p-4 sm:p-5 ${borderPrio}`}
      role="article"
      aria-label={`Skill: ${entry.skill}, Priority ${entry.priority}, Gap ${entry.gap}%`}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold text-[color:var(--ns-text)] truncate">
              {entry.skill}
            </h3>
            <span className={PRIORITY_BADGE[entry.priority]}>
              {PRIORITY_LABEL[entry.priority]} PRIORITY
            </span>
            <span className={DIFFICULTY_STYLE[entry.difficulty]}>
              {DIFFICULTY_LABEL[entry.difficulty]}
            </span>
            {entry.isAcquired && (
              <span className="ns-badge ns-badge-success inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                ACQUIRED
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 p-3 rounded-2xl bg-[color:var(--ns-surface-2)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[color:var(--ns-text-subtle)]">Proficiency</span>
                <span className={`text-[11px] font-black ${
                  entry.proficiency.pct >= 90 ? 'text-[color:var(--ns-success)]' :
                  entry.proficiency.pct >= 40 ? 'text-[color:var(--ns-warning)]' :
                  'text-[color:var(--ns-danger)]'
                }`}>
                  {entry.proficiency.pct}% · {entry.proficiency.label}
                </span>
              </div>
              <AnimatedProgress value={entry.proficiency.pct} color={entry.proficiency.color} duration={0.6 + index * 0.02} />
            </div>

            <div className="space-y-2 p-3 rounded-2xl bg-[color:var(--ns-surface-2)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[color:var(--ns-text-subtle)]">Gap Size</span>
                <span className={`text-[11px] font-black ${gapTextCol}`}>
                  {entry.gap}% gap
                </span>
              </div>
              <AnimatedProgress value={entry.gap} color={gapColor} duration={0.7 + index * 0.02} />
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-[color:var(--ns-primary-50)] to-[color:var(--ns-accent-50)] dark:from-[color:var(--ns-primary-900)]/20 dark:to-[color:var(--ns-accent-900)]/20 border border-[color:var(--ns-border-soft)]">
            <div className="w-8 h-8 rounded-xl bg-[color:var(--ns-surface)] shadow-sm flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[color:var(--ns-primary-600)] dark:text-[color:var(--ns-primary-400)]" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[color:var(--ns-text-subtle)]">
                Recommended Action
              </p>
              <p className="text-xs font-bold text-[color:var(--ns-text)] leading-snug">
                {entry.rec.text}
              </p>
              <p className="text-[10px] text-[color:var(--ns-text-muted)] font-medium">
                via {entry.rec.provider}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-44 flex lg:flex-col gap-2 lg:justify-start shrink-0">
          {isMissing ? (
            <button
              onClick={() => onNavigate?.('courses')}
              className="ns-btn ns-btn-primary flex-1 lg:flex-none text-xs"
              aria-label={`Start learning ${entry.skill}`}
            >
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Start Learning</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate?.('courses')}
              className="ns-btn ns-btn-secondary flex-1 lg:flex-none text-xs"
              aria-label={`Advanced practice for ${entry.skill}`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Advanced Practice</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function SkillGapTab({ profile, onNavigate, lang = 'en' }) {
  const rankedCareers = useMemo(() => rankAllCareers(profile ?? {}), [profile]);
  const topCareer = rankedCareers[0] ?? CAREERS_DATA[0];

  const [targetCareerId, setTargetCareerId] = useState(topCareer.id);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [dbCareers, setDbCareers] = useState([]);
  const [careersLoading, setCareersLoading] = useState(true);

  useEffect(() => {
    fetch('/api/careers?limit=100')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data?.length) setDbCareers(data.data); })
      .catch(() => {})
      .finally(() => setCareersLoading(false));
  }, []);

  const allCareers = useMemo(() => {
    if (!dbCareers.length) return CAREERS_DATA;
    const mapped = dbCareers.map(c => ({
      ...c,
      requiredSkills: Array.isArray(c.required_skills) ? c.required_skills
        : Array.isArray(c.requiredSkills) ? c.requiredSkills
        : typeof c.required_skills === 'string'
          ? (() => { try { return JSON.parse(c.required_skills); } catch { return []; } })()
          : [],
      riasecMatch: c.riasec_code ? c.riasec_code.split('-') : [],
      demandLevel: c.demand_level || c.demandLevel || 'Moderate',
    }));
    const seen = new Set(mapped.map(c => c.title));
    const staticOnly = CAREERS_DATA.filter(c => !seen.has(c.title));
    return [...mapped, ...staticOnly];
  }, [dbCareers]);

  const targetCareer = useMemo(
    () => allCareers.find(c => c.id === targetCareerId) ?? allCareers[0] ?? CAREERS_DATA[0],
    [targetCareerId, allCareers]
  );

  const skillGap = useMemo(
    () => computeSkillGap(profile, targetCareer),
    [profile, targetCareer]
  );

  const allSkills = useMemo(() => {
    const required = targetCareer.requiredSkills ?? targetCareer.required_skills ?? [];
    const requiredArr = Array.isArray(required) ? required
      : typeof required === 'string' ? (() => { try { return JSON.parse(required); } catch { return [required]; } })()
      : [];
    return requiredArr.map((skill, idx) => {
      const missingEntry = (skillGap?.missingSkills ?? []).find(m => m.skill === skill);
      const priority = missingEntry?.priority ?? (idx < 3 ? 'High' : idx < 6 ? 'Medium' : 'Low');
      const difficulty = missingEntry?.difficulty ?? 'Beginner';
      const isAcquired = (skillGap?.currentSkills ?? []).includes(skill) ||
        (skillGap?.currentSkills ?? []).some(cs => {
          const n1 = cs.toLowerCase().replace(/[^a-z0-9]/g, '');
          const n2 = skill.toLowerCase().replace(/[^a-z0-9]/g, '');
          return n1 === n2 || (n1.length >= 4 && (n2.includes(n1) || n1.includes(n2)));
        });
      const proficiency = getProficiencyInfo(skill, skillGap.currentSkills);
      const gap = 100 - proficiency.pct;
      const rec = getLearningRecommendation(skill);
      return {
        skill,
        priority,
        difficulty,
        isAcquired,
        proficiency,
        gap,
        rec,
        order: idx,
      };
    });
  }, [targetCareer, skillGap]);

  const filteredSkills = useMemo(() => {
    let list = [...allSkills];
    switch (activeFilter) {
      case 'missing': list = list.filter(s => !s.isAcquired); break;
      case 'acquired': list = list.filter(s => s.isAcquired); break;
      case 'high': list = list.filter(s => s.priority === 'High'); break;
      case 'medium': list = list.filter(s => s.priority === 'Medium'); break;
      case 'low': list = list.filter(s => s.priority === 'Low'); break;
    }
    const prioRank = { High: 0, Medium: 1, Low: 2 };
    const diffRank = { Advanced: 2, Intermediate: 1, Beginner: 0 };
    switch (sortBy) {
      case 'alpha': list.sort((a, b) => a.skill.localeCompare(b.skill)); break;
      case 'gap': list.sort((a, b) => b.gap - a.gap); break;
      case 'difficulty': list.sort((a, b) => diffRank[b.difficulty] - diffRank[a.difficulty]); break;
      case 'priority':
      default:
        list.sort((a, b) => prioRank[a.priority] - prioRank[b.priority] || a.order - b.order);
    }
    return list;
  }, [allSkills, activeFilter, sortBy]);

  const recommendedCourses = useMemo(() => {
    const missingNames = (skillGap?.missingSkills ?? []).map(s => s.skill.toLowerCase());
    return COURSES_DATA.filter(course =>
      course.skills?.some(s =>
        missingNames.some(m => s.toLowerCase().includes(m) || m.includes(s.toLowerCase()))
      )
    );
  }, [skillGap]);

  const triggerConfetti = () => {
    if (skillGap.skillMatchPct >= 80) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleCareerChange = (id) => {
    setTargetCareerId(id);
    triggerConfetti();
  };

  const noProfileData = !profile || !profile.skills || profile.skills.length === 0;
  const totalSkills = skillGap.totalRequired || 0;
  const skillsHave = skillGap.totalHave || 0;
  const skillsToDev = Math.max(0, totalSkills - skillsHave);
  const completionPct = skillGap.skillMatchPct || 0;
  const highPrioCount = allSkills.filter(s => s.priority === 'High' && !s.isAcquired).length;

  if (!profile) {
    return (
      <div className="space-y-6">
        <StaggerWrap delay={0}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[color:var(--ns-primary-900)] to-slate-950 p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-800">
            <div className="ns-accent-glow-left" aria-hidden="true" />
            <div className="ns-accent-glow-right" aria-hidden="true" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[color:var(--ns-primary-500)] to-[color:var(--ns-accent-500)] flex items-center justify-center shadow-xl shadow-[color:var(--ns-primary-500)]/30 shrink-0">
                <TrendingUp className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {lang === 'ur' ? 'اسکل گیپ تجزیہ کار' : 'Skill Gap Analysis'}
                </h1>
                <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
                  {lang === 'ur'
                    ? 'طلباء پروفائل اور سپریم تجویز کردہ کیریئر تقاضوں کی بنیاد پر تجزیہ'
                    : 'Analysis based on student profile vs top recommended career requirements'}
                </p>
              </div>
            </div>
          </div>
        </StaggerWrap>

        <StaggerWrap delay={0.08}>
          <div className="ns-card p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[color:var(--ns-warning-bg)] flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-[color:var(--ns-warning)]" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-[color:var(--ns-text)] mb-2">
              Complete your profile first
            </h3>
            <p className="text-sm text-[color:var(--ns-text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
              We need your skills, academic background, and interests to generate a personalised skill gap analysis
            </p>
            <button
              onClick={() => onNavigate?.('onboarding')}
              className="ns-btn ns-btn-primary ns-btn-lg"
              aria-label="Start onboarding wizard to complete your profile"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Start Onboarding Wizard</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </StaggerWrap>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Skill Gap Analysis">
      {/* ────────────── HERO HEADER ────────────── */}
      <StaggerWrap delay={0}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 md:p-8 shadow-2xl border border-slate-800/80">
          <div className="ns-accent-glow-left" aria-hidden="true" />
          <div className="ns-accent-glow-right" aria-hidden="true" />
          <div className="absolute top-10 right-24 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[color:var(--ns-primary-500)] via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-[color:var(--ns-primary-500)]/30 shrink-0">
                  <TrendingUp className="w-7 h-7" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {lang === 'ur' ? 'اسکل گیپ تجزیہ کار' : 'Skill Gap Analysis'}
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                    {lang === 'ur'
                      ? 'طلباء پروفائل اور سپریم تجویز کردہ کیریئر تقاضوں کی بنیاد پر تجزیہ'
                      : 'Analysis based on your profile vs top recommended career requirements. Targets specific gaps with actionable learning paths.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-[11px] font-bold text-slate-300 backdrop-blur">
                      <Target className="w-3 h-3 text-[color:var(--ns-primary-400)]" aria-hidden="true" />
                      Target: {targetCareer.title}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-[11px] font-bold text-slate-300 backdrop-blur">
                      <Layers className="w-3 h-3 text-amber-400" aria-hidden="true" />
                      Demand: {targetCareer.demandLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs w-full sm:w-auto" role="group" aria-label="Career selection">
                  <label htmlFor="target-career-select" className="text-slate-400 font-semibold whitespace-nowrap shrink-0">
                    {lang === 'ur' ? 'ہدف کیریئر:' : 'Target Career:'}
                  </label>
                  <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
                    <select
                      id="target-career-select"
                      value={targetCareerId}
                      onChange={(e) => handleCareerChange(e.target.value)}
                      className="ns-select text-xs font-bold bg-slate-800/70 text-[color:var(--ns-primary-300)] border-slate-700/60 backdrop-blur cursor-pointer min-w-0 w-full"
                      aria-label="Select target career for skill gap analysis"
                    >
                      {allCareers.map((c, idx) => (
                        <option key={c.id} value={c.id}>
                          {idx === 0 ? '★ Top Match — ' : ''}{c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate?.('courses')}
                    className="ns-btn ns-btn-sm flex-1 sm:flex-none bg-gradient-to-r from-[color:var(--ns-primary-500)] to-teal-400 hover:from-[color:var(--ns-primary-400)] hover:to-teal-300 text-slate-950 border-0 shadow-md shadow-[color:var(--ns-primary-500)]/25"
                    aria-label="Browse courses to close skill gaps"
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Courses</span>
                  </button>
                  <button
                    onClick={() => onNavigate?.('careerRoadmap')}
                    className="ns-btn ns-btn-sm ns-btn-secondary flex-1 sm:flex-none bg-slate-800/50 border-slate-700/60 text-slate-200 hover:bg-slate-700/60"
                    aria-label="View career roadmap"
                  >
                    <Target className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Roadmap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StaggerWrap>

      {/* ────────────── NO PROFILE WARNING ────────────── */}
      {noProfileData && (
        <StaggerWrap delay={0.05}>
          <div className="ns-alert ns-alert-warning" role="alert">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs leading-relaxed">
              <strong>No skills in your profile yet.</strong> Complete the{' '}
              <button
                onClick={() => onNavigate?.('onboarding')}
                className="underline font-bold hover:opacity-80 cursor-pointer transition-opacity"
                aria-label="Go to onboarding wizard step 3 skills"
              >
                Onboarding Wizard
              </button>{' '}
              (Step 3 — Skills) for a personalised gap analysis. Showing baseline gap for comparison.
            </div>
          </div>
        </StaggerWrap>
      )}

      {/* ────────────── KPI CARDS + MATCH RING ────────────── */}
      <StaggerWrap delay={0.08}>
        <div className="ns-card p-5 sm:p-6 md:p-7 relative overflow-hidden">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex items-start gap-4 xl:gap-5 shrink-0 xl:w-auto xl:pr-6 xl:border-r border-[color:var(--ns-border-soft)]">
              <MatchRing score={completionPct} size={104} strokeWidth={9} />
              <div className="flex-1 min-w-0 space-y-1.5 pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[color:var(--ns-text-subtle)]">Overall Readiness</p>
                <h2 className="text-lg sm:text-xl font-extrabold text-[color:var(--ns-text)] leading-tight">
                  Career Skill Match
                </h2>
                <p className="text-xs text-[color:var(--ns-text-muted)] leading-relaxed">
                  You have <strong className="text-[color:var(--ns-text)]">{skillsHave}</strong> of <strong className="text-[color:var(--ns-text)]">{totalSkills}</strong> required skills for{' '}
                  <strong className="text-[color:var(--ns-primary-700)] dark:text-[color:var(--ns-primary-400)]">{targetCareer.title}</strong>
                </p>
                <div className="w-full pt-1 max-w-xs">
                  <AnimatedProgress
                    value={completionPct}
                    color={completionPct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : completionPct >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'}
                    duration={1.2}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1 min-w-0">
              <KpiCard label="Skills Have" value={skillsHave} sub={`of ${totalSkills} total`} icon={CheckCircle2} tone="success" delay={0.1} />
              <KpiCard label="To Develop" value={skillsToDev} sub="missing + partial" icon={AlertCircle} tone="danger" delay={0.15} />
              <KpiCard label="Match %" value={`${completionPct}%`} sub={completionPct >= 70 ? 'Interview Ready' : completionPct >= 40 ? 'Progressing' : 'Needs Work'} icon={Gauge} tone="primary" delay={0.2} />
              <KpiCard label="High Priority" value={highPrioCount} sub="critical gaps" icon={Target} tone="warning" delay={0.25} />
            </div>
          </div>
        </div>
      </StaggerWrap>

      {/* ────────────── MAIN GRID ────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4 min-w-0">
          {/* ────────────── FILTER + SORT TOOLBAR ────────────── */}
          <StaggerWrap delay={0.15}>
            <div className="ns-card p-4 space-y-3.5" role="toolbar" aria-label="Filter and sort skills">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[color:var(--ns-text-subtle)] mr-1 shrink-0">
                    <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Filter</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1 min-w-0" role="tablist" aria-label="Skill filter tabs">
                    {FILTER_TABS.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveFilter(tab.key)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all border cursor-pointer ${
                            isActive
                              ? 'bg-[color:var(--ns-primary-600)] text-white border-[color:var(--ns-primary-600)] shadow-md shadow-[color:var(--ns-primary-500)]/25'
                              : 'bg-[color:var(--ns-surface-2)] text-[color:var(--ns-text-muted)] border-[color:var(--ns-border)] hover:bg-[color:var(--ns-surface-3)] hover:text-[color:var(--ns-text)]'
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                          <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[color:var(--ns-border-soft)] pt-3">
                  <p className="text-[11px] text-[color:var(--ns-text-muted)] font-medium">
                    Showing <strong className="text-[color:var(--ns-text)]">{filteredSkills.length}</strong> of {allSkills.length} skills
                  </p>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-[color:var(--ns-text-faint)]" aria-hidden="true">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label htmlFor="skill-sort" className="sr-only">Sort skills by</label>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[color:var(--ns-text-faint)]" aria-hidden="true" />
                      <select
                        id="skill-sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="ns-select px-2.5 py-1.5 text-[11px] font-bold cursor-pointer w-auto"
                      >
                        {SORT_OPTIONS.map(opt => (
                          <option key={opt.key} value={opt.key}>Sort: {opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerWrap>

          {/* ────────────── SKILL CARDS LIST ────────────── */}
          <div className="space-y-3" role="list" aria-label="Skill analysis results">
            {careersLoading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Loading skill data">
                {[0, 1, 2].map(i => (
                  <div key={i} className="ns-card p-5 space-y-4">
                    <div className="flex gap-2">
                      <div className="ns-skeleton h-5 w-36" />
                      <div className="ns-skeleton h-5 w-20" />
                      <div className="ns-skeleton h-5 w-16" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="ns-skeleton h-3 w-full" />
                        <div className="ns-skeleton h-2.5 w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="ns-skeleton h-3 w-full" />
                        <div className="ns-skeleton h-2.5 w-full" />
                      </div>
                    </div>
                    <div className="ns-skeleton h-16 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : filteredSkills.length === 0 ? (
              <StaggerWrap delay={0.1}>
                <div className="ns-card">
                  <div className="ns-empty">
                    <div className="ns-empty-icon">
                      <Search className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h3 className="ns-empty-title">No skills match this filter</h3>
                    <p className="ns-empty-sub">Try selecting a different filter tab above or adjust your target career.</p>
                  </div>
                </div>
              </StaggerWrap>
            ) : (
              filteredSkills.map((entry, idx) => (
                <div key={entry.skill} role="listitem">
                  <SkillCard entry={entry} index={idx} onNavigate={onNavigate} />
                </div>
              ))
            )}
          </div>

          {/* ────────────── RECOMMENDED COURSES ────────────── */}
          {recommendedCourses.length > 0 && (
            <StaggerWrap delay={0.35}>
              <div className="ns-card p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[color:var(--ns-success-bg)] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4.5 h-4.5 text-[color:var(--ns-success)]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-[color:var(--ns-text)]">
                        Recommended Courses to Close Gaps
                      </h2>
                      <p className="text-[11px] text-[color:var(--ns-text-muted)] font-medium">
                        Matched to your missing skill requirements
                      </p>
                    </div>
                  </div>
                  <span className="ns-badge ns-badge-success">
                    {recommendedCourses.length} Matched
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedCourses.slice(0, 4).map((course, idx) => (
                    <motion.article
                      key={course.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + idx * 0.06 }}
                      className="ns-card ns-card-hover p-4 sm:p-5 space-y-3"
                      role="article"
                      aria-label={`Course: ${course.title} by ${course.provider}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[color:var(--ns-success)] block">
                            {course.provider}
                          </span>
                          <h3 className="font-extrabold text-[color:var(--ns-text)] text-sm mt-0.5 leading-tight">{course.title}</h3>
                        </div>
                        <span className="ns-badge ns-badge-success shrink-0">
                          {course.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[color:var(--ns-text-muted)] font-semibold">
                        <span>Duration: {course.duration}</span>
                        <span>·</span>
                        <span>★ {course.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(course.skills ?? []).slice(0, 3).map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="ns-tag text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => onNavigate?.('courses')}
                        className="ns-btn ns-btn-primary w-full text-xs"
                        aria-label={`View course: ${course.title}`}
                      >
                        <span>View Course</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </motion.article>
                  ))}
                </div>
              </div>
            </StaggerWrap>
          )}
        </div>

        {/* ────────────── RIGHT SIDEBAR ────────────── */}
        <div className="space-y-4 xl:sticky xl:top-4 self-start">
          {/* ────────────── PK LEARNING RESOURCES ────────────── */}
          <StaggerWrap delay={0.25}>
            <div className="ns-card p-5 sm:p-6 space-y-4.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[color:var(--ns-primary-500)] to-emerald-400 text-white flex items-center justify-center shadow-md shadow-[color:var(--ns-primary-500)]/25">
                  <GraduationCap className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-extrabold text-[color:var(--ns-text)] text-sm leading-tight">
                    Free Learning Resources
                  </h2>
                  <p className="text-[11px] text-[color:var(--ns-text-muted)] font-medium">
                    Pakistan-specific free programmes
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                {PK_LEARNING_RESOURCES.map((res, idx) => (
                  <motion.a
                    key={res.name}
                    href={res.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + idx * 0.06 }}
                    className="block p-3.5 rounded-2xl border border-[color:var(--ns-border)] hover:border-[color:var(--ns-primary-400)] bg-[color:var(--ns-surface)] hover:bg-[color:var(--ns-primary-50)] dark:hover:bg-[color:var(--ns-primary-900)]/15 transition-all group focus-visible:ring-2 focus-visible:ring-[color:var(--ns-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ns-surface)] outline-none"
                    aria-label={`Open ${res.name} in a new tab`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[color:var(--ns-text)] group-hover:text-[color:var(--ns-primary-700)] dark:group-hover:text-[color:var(--ns-primary-400)] truncate transition-colors">
                            {res.name}
                          </span>
                          <span className={res.badgeClass}>{res.badge}</span>
                        </div>
                        <p className="text-[11px] text-[color:var(--ns-text-muted)] leading-snug">
                          {res.desc}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[color:var(--ns-text-faint)] group-hover:text-[color:var(--ns-primary-600)] dark:group-hover:text-[color:var(--ns-primary-400)] shrink-0 mt-0.5 transition-colors" aria-hidden="true" />
                    </div>
                  </motion.a>
                ))}
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[color:var(--ns-primary-50)] to-teal-50 dark:from-[color:var(--ns-primary-900)]/30 dark:to-teal-950/20 p-4 border border-[color:var(--ns-primary-100)] dark:border-[color:var(--ns-primary-900)]/50">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[color:var(--ns-primary-700)] dark:text-[color:var(--ns-primary-400)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[color:var(--ns-primary-800)] dark:text-[color:var(--ns-primary-300)]">Pro Tip</p>
                    <p className="text-[11px] text-[color:var(--ns-primary-700)] dark:text-[color:var(--ns-primary-400)] mt-0.5 leading-relaxed">
                      Start with HIGH priority gaps first — tackling just the top 3 skills closes ~60% of your total gap and maximises interview readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StaggerWrap>

          {/* ────────────── AT A GLANCE SUMMARY ────────────── */}
          <StaggerWrap delay={0.35}>
            <div className="ns-card p-5 sm:p-6 space-y-4">
              <h3 className="ns-section-title">
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                At a Glance
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--ns-surface-2)]">
                  <span className="text-[11px] text-[color:var(--ns-text-muted)] font-semibold">High Priority Gaps</span>
                  <span className="text-xs font-black text-[color:var(--ns-danger)] tabular-nums">
                    {allSkills.filter(s => s.priority === 'High' && !s.isAcquired).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--ns-surface-2)]">
                  <span className="text-[11px] text-[color:var(--ns-text-muted)] font-semibold">Hardest (Advanced)</span>
                  <span className="text-xs font-black text-[color:var(--ns-danger)] tabular-nums">
                    {allSkills.filter(s => s.difficulty === 'Advanced').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--ns-surface-2)]">
                  <span className="text-[11px] text-[color:var(--ns-text-muted)] font-semibold">Already Proficient</span>
                  <span className="text-xs font-black text-[color:var(--ns-success)] tabular-nums">
                    {allSkills.filter(s => s.isAcquired).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--ns-surface-2)]">
                  <span className="text-[11px] text-[color:var(--ns-text-muted)] font-semibold">Career Demand</span>
                  <span className="ns-badge ns-badge-primary text-[10px]">{targetCareer.demandLevel}</span>
                </div>
              </div>
            </div>
          </StaggerWrap>
        </div>
      </div>
    </div>
  );
}
