import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  ArrowRight, Filter, ArrowUpDown,
  BookOpen, GraduationCap, ExternalLink,
  Sparkles, Target, Award, Zap,
  Clock, BarChart3, ChevronRight,
  AlertCircle, CheckCircle2, TrendingUp
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
    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
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

export function SkillGapTab({ profile, onNavigate, lang = 'en' }) {
  const rankedCareers = useMemo(() => rankAllCareers(profile ?? {}), [profile]);
  const topCareer = rankedCareers[0] ?? CAREERS_DATA[0];

  const [targetCareerId, setTargetCareerId] = useState(topCareer.id);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [dbCareers, setDbCareers] = useState([]);  // careers from DB

  // Load careers from DB — use DB skills if available, fall back to static
  useEffect(() => {
    fetch('/api/careers?limit=100')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data?.length) setDbCareers(data.data); })
      .catch(() => {});
  }, []);

  // Merge DB + static careers — prefer DB (has career_skills FK data)
  const allCareers = useMemo(() => {
    if (!dbCareers.length) return CAREERS_DATA;
    // Map DB careers to the same shape as static
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
    // Deduplicate by title
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

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {lang === 'ur' ? 'اسکل گیپ تجزیہ کار' : 'Skill Gap Analysis'}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {lang === 'ur'
                  ? 'طلباء پروفائل اور سپریم تجویز کردہ کیریئر تقاضوں کی بنیاد پر تجزیہ'
                  : 'Analysis based on student profile vs top recommended career requirements'}
              </p>
            </div>
          </div>
        </div>
        <div className="ns-card rounded-3xl p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Complete your profile first
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We need your skills, academic background, and interests to generate a personalised skill gap analysis
          </p>
          <button
            onClick={() => onNavigate?.('onboarding')}
            className="ns-btn ns-btn-primary inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Onboarding Wizard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaggerWrap delay={0}>
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl pointer-events-none opacity-0 dark:opacity-100" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none opacity-0 dark:opacity-100" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'ur' ? 'اسکل گیپ تجزیہ کار' : 'Skill Gap Analysis'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {lang === 'ur'
                    ? 'طلباء پروفائل اور سپریم تجویز کردہ کیریئر تقاضوں کی بنیاد پر تجزیہ'
                    : 'Analysis based on your profile vs top recommended career requirements. Targets specific gaps with actionable learning paths.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                {lang === 'ur' ? 'ہدف کیریئر:' : 'Target Career:'}
              </span>
              <select
                value={targetCareerId}
                onChange={(e) => handleCareerChange(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-blue-300 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none cursor-pointer text-xs min-w-[180px]"
              >
                {CAREERS_DATA.map((c, idx) => (
                  <option key={c.id} value={c.id}>
                    {idx === 0 ? '★ Top Match — ' : ''}{c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </StaggerWrap>

      {noProfileData && (
        <StaggerWrap delay={0.05}>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <strong>No skills in your profile yet.</strong> Complete the{' '}
              <button
                onClick={() => onNavigate('onboarding')}
                className="underline font-bold hover:text-amber-600 cursor-pointer"
              >
                Onboarding Wizard
              </button>{' '}
              (Step 3 — Skills) for a personalised gap analysis. Showing baseline gap for comparison.
            </div>
          </div>
        </StaggerWrap>
      )}

      <StaggerWrap delay={0.1}>
        <div className="ns-card rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Skills</div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalSkills}</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Already Have</div>
                  <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{skillsHave}</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">To Develop</div>
                  <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{skillsToDev}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Overall Readiness
                  </span>
                  <span className={`text-xs font-extrabold ${
                    completionPct >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                    completionPct >= 40 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {completionPct}% Complete
                  </span>
                </div>
                <div className="ns-progress h-4 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      completionPct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                      completionPct >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You have <strong>{skillsHave}</strong> of <strong>{totalSkills}</strong> required skills for{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{targetCareer.title}</strong>
                </p>
              </div>
            </div>
            <div className="lg:w-px lg:h-32 w-full h-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex gap-3 lg:flex-col lg:w-48">
              <button
                onClick={() => onNavigate('courses')}
                className="ns-btn ns-btn-primary flex-1 inline-flex items-center justify-center gap-1.5 text-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse Courses</span>
              </button>
              <button
                onClick={() => onNavigate('roadmap')}
                className="ns-btn ns-btn-secondary flex-1 inline-flex items-center justify-center gap-1.5 text-xs"
              >
                <Target className="w-3.5 h-3.5" />
                <span>View Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      </StaggerWrap>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <StaggerWrap delay={0.15}>
            <div className="ns-card rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>FILTER:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.key} value={opt.key}>Sort: {opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>Showing <strong className="text-slate-800 dark:text-slate-200">{filteredSkills.length}</strong> of {allSkills.length} skills</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High Priority</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                </div>
              </div>
            </div>
          </StaggerWrap>

          <div className="space-y-3">
            {filteredSkills.length === 0 ? (
              <StaggerWrap>
                <div className="ns-card rounded-3xl p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No skills match this filter</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Try a different filter tab</p>
                </div>
              </StaggerWrap>
            ) : (
              filteredSkills.map((entry, idx) => {
                const gapColor = entry.gap <= 10 ? 'bg-emerald-500' : entry.gap <= 55 ? 'bg-amber-500' : 'bg-red-500';
                const isMissing = !entry.isAcquired;
                return (
                  <motion.div
                    key={entry.skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 + idx * 0.03 }}
                  >
                    <div className={`ns-card rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all ${
                      entry.priority === 'High' ? 'border-l-4 border-red-500' :
                      entry.priority === 'Medium' ? 'border-l-4 border-amber-500' :
                      'border-l-4 border-emerald-500'
                    }`}>
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
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
                                <CheckCircle2 className="w-3 h-3" />
                                ACQUIRED
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-600 dark:text-slate-400">Proficiency</span>
                                <span className={`font-extrabold ${
                                  entry.proficiency.pct >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                                  entry.proficiency.pct >= 40 ? 'text-amber-600 dark:text-amber-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {entry.proficiency.pct}% · {entry.proficiency.label}
                                </span>
                              </div>
                              <AnimatedProgress value={entry.proficiency.pct} color={entry.proficiency.color} duration={0.6 + idx * 0.02} />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-600 dark:text-slate-400">Gap Size</span>
                                <span className={`font-extrabold ${
                                  entry.gap <= 10 ? 'text-emerald-600 dark:text-emerald-400' :
                                  entry.gap <= 55 ? 'text-amber-600 dark:text-amber-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {entry.gap}% gap
                                </span>
                              </div>
                              <AnimatedProgress value={entry.gap} color={gapColor} duration={0.7 + idx * 0.02} />
                            </div>
                          </div>

                          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Recommended Action
                              </div>
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {entry.rec.text}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                via {entry.rec.provider}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-40 flex lg:flex-col gap-2 lg:justify-start shrink-0">
                          {isMissing ? (
                            <button
                              onClick={() => onNavigate('courses')}
                              className="ns-btn ns-btn-primary inline-flex items-center justify-center gap-1.5 text-xs flex-1 lg:flex-none"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Start Learning</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigate('courses')}
                              className="ns-btn ns-btn-secondary inline-flex items-center justify-center gap-1.5 text-xs flex-1 lg:flex-none"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Advanced Practice</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {recommendedCourses.length > 0 && (
            <StaggerWrap delay={0.35}>
              <div className="ns-card rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Recommended Courses to Close Gaps
                    </h2>
                  </div>
                  <span className="ns-badge ns-badge-success">
                    {recommendedCourses.length} Matched
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedCourses.slice(0, 4).map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2.5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider block">
                            {course.provider}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{course.title}</h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                          {course.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>Duration: {course.duration}</span>
                        <span>·</span>
                        <span>★ {course.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(course.skills ?? []).slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => onNavigate('courses')}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>View Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </StaggerWrap>
          )}
        </div>

        <div className="space-y-4">
          <StaggerWrap delay={0.25}>
            <div className="ns-card rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Free Learning Resources
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pakistan-specific free programmes
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {PK_LEARNING_RESOURCES.map((res, idx) => (
                  <motion.a
                    key={res.name}
                    href={res.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + idx * 0.06 }}
                    className="block p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                            {res.name}
                          </span>
                          <span className={res.badgeClass}>{res.badge}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {res.desc}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0 mt-0.5" />
                    </div>
                  </motion.a>
                ))}
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 p-4 border border-emerald-100 dark:border-emerald-900">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">Pro Tip</div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-snug">
                      Start with HIGH priority gaps first — tackling just the top 3 skills closes ~60% of your total gap and maximises interview readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StaggerWrap>

          <StaggerWrap delay={0.35}>
            <div className="ns-card rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                At a Glance
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">High Priority Gaps</span>
                  <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                    {allSkills.filter(s => s.priority === 'High' && !s.isAcquired).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Hardest (Advanced)</span>
                  <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                    {allSkills.filter(s => s.difficulty === 'Advanced').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Already Proficient</span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {allSkills.filter(s => s.isAcquired).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Career Demand</span>
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
