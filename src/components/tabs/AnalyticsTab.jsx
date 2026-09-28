import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  BarChart3, TrendingUp, Award, CheckCircle2, Download,
  AlertCircle, Loader2, RefreshCw, Target, Sparkles, BookOpen,
  Briefcase, User, Calendar, ArrowUp, ArrowDown,
  Activity, Clock, FileText, ChevronRight, Zap,
} from 'lucide-react';
import { loadAnalyticsData } from '../../services/analyticsService.js';

const PALETTE = {
  emerald: '#059669',
  indigo:  '#6366f1',
  amber:   '#d97706',
  violet:  '#7c3aed',
  teal:    '#0891b2',
};

const PIE_COLORS = [PALETTE.emerald, PALETTE.indigo, PALETTE.amber, PALETTE.violet, PALETTE.teal, '#ef4444'];
const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'All time'];

function MiniRing({ pct, size = 44, stroke = 4, color = PALETTE.emerald }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-slate-200 dark:text-slate-700" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-200">
        {pct}%
      </text>
    </svg>
  );
}

function ChartTooltip({ isDark }) {
  return {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    borderRadius: '14px',
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '11px',
    padding: '10px 14px',
    boxShadow: '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
  };
}

function NsEmpty({ icon: Icon, title, body, action }) {
  return (
    <div className="ns-empty">
      <div className="ns-empty-icon">
        {Icon && <Icon className="w-7 h-7" />}
      </div>
      <div className="space-y-1">
        <div className="ns-empty-title">{title}</div>
        <div className="ns-empty-sub">{body}</div>
      </div>
      {action}
    </div>
  );
}

function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="ns-card ns-card-hover p-6"
    >
      <div className="mb-4">
        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function GradientDefs() {
  return (
    <defs>
      <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={PALETTE.emerald} stopOpacity={0.38} />
        <stop offset="100%" stopColor={PALETTE.emerald} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={PALETTE.indigo} stopOpacity={0.32} />
        <stop offset="100%" stopColor={PALETTE.indigo} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="gradTeal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={PALETTE.teal} />
        <stop offset="100%" stopColor={PALETTE.emerald} />
      </linearGradient>
      <linearGradient id="gradBarEmerald" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={PALETTE.emerald} />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
  );
}

export function AnalyticsTab({ profile, lang, onNavigate }) {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('All time');

  const axisText = isDark ? '#94a3b8' : '#64748b';
  const gridLine = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(226,232,240,0.7)';
  const tooltipStyle = useMemo(() => ChartTooltip({ isDark }), [isDark]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadAnalyticsData(profile);
      setData(result);
    } catch (err) {
      setError('Failed to load analytics data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = () => window.print();

  const d = data ?? {};
  const { profileCompletion, skillGapSummary, roadmap, interviewAnalytics, applications, bestCareerScore } = d;
  const careerMatches = Array.isArray(d?.careerMatches) ? d.careerMatches : [];
  const skillReadiness = Array.isArray(d?.skillReadiness) ? d.skillReadiness : [];
  const academicMarks = Array.isArray(d?.academicMarks) ? d.academicMarks : [];

  const roadmapMilestones = Array.isArray(roadmap?.perMilestone) ? roadmap.perMilestone : [];
  const activityTimelineData = roadmapMilestones.map((m) => ({
    label: m.name,
    progress: m.pct,
    tasks: m.completed,
  })) || [];

  const interviewTrendData = Array.isArray(interviewAnalytics?.chartData) ? interviewAnalytics.chartData : [];

  const skillMatchData = skillReadiness.slice(0, 10).map(s => ({
    skill: s.skill,
    match: s.status === 'have' ? 100 : 0,
    missing: s.status === 'missing' ? 100 : 0,
  }));

  const careerMatchData = careerMatches.slice(0, 5).map(c => ({
    name: c.shortTitle,
    score: c.score,
    demand: c.demandLevel,
  }));

  const categoryData = useMemo(() => {
    const cats = [];
    if (Array.isArray(applications?.byType) && applications.byType.length) {
      applications.byType.forEach(a => cats.push({ name: a.name, value: a.value }));
    }
    const roadmapDone = roadmap?.doneTasks ?? 0;
    if (roadmapDone > 0) cats.push({ name: 'Roadmap Tasks', value: roadmapDone });
    const interviews = interviewAnalytics?.totalSessions ?? 0;
    if (interviews > 0) cats.push({ name: 'Interviews', value: interviews });
    const skillCount = skillGapSummary?.totalHave ?? 0;
    if (skillCount > 0) cats.push({ name: 'Skills', value: skillCount });
    return cats;
  }, [applications, roadmap, interviewAnalytics, skillGapSummary]);

  const recentActivity = useMemo(() => {
    const events = [];
    if (Array.isArray(applications?.recentApplications)) {
      applications.recentApplications.forEach(a => {
        events.push({
          date: a.createdAt || a.date || '—',
          type: 'Application',
          detail: `${a.type || 'Job'} — ${a.title || a.company || 'Submitted'}`,
          metric: a.status || 'Submitted',
          metricColor: 'text-indigo-600 dark:text-indigo-400',
        });
      });
    }
    if (interviewTrendData.length) {
      interviewTrendData.slice().reverse().forEach(s => {
        events.push({
          date: s.date || '—',
          type: 'Interview',
          detail: `${s.category || 'Mock'} — Session ${s.session}`,
          metric: `${s.score}%`,
          metricColor: s.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : s.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500',
        });
      });
    }
    if (roadmapMilestones.length) {
      roadmapMilestones.forEach(m => {
        if (m.completed > 0) {
          events.push({
            date: roadmap.lastUpdated || '—',
            type: 'Roadmap',
            detail: `${m.fullTitle || m.name}`,
            metric: `${m.completed}/${m.total} done`,
            metricColor: 'text-teal-600 dark:text-teal-400',
          });
        }
      });
    }
    return events.slice(0, 8);
  }, [applications, interviewTrendData, roadmap, roadmapMilestones]);

  const totalRoadmapDone = roadmap?.doneTasks ?? 0;
  const totalRoadmapAll = roadmap?.totalTasks ?? 0;
  const roadmapTrend = roadmap?.overallPct ?? 0;

  const totalInterviews = interviewAnalytics?.totalSessions ?? 0;
  const avgInterview = interviewAnalytics?.avg ?? 0;

  const skillsHave = skillGapSummary?.totalHave ?? 0;
  const skillsPct = skillGapSummary?.skillMatchPct ?? 0;

  const profilePct = profileCompletion?.pct ?? 0;

  const containerBase = { height: 260 };

  if (loading) {
    return <div className="space-y-5"><div className="h-32 rounded-3xl bg-slate-800/70 animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />)}</div></div>;
  }

  if (error) {
    return <div className="bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-800 p-8 text-center space-y-3"><AlertCircle className="w-8 h-8 text-red-500 mx-auto" /><p className="text-sm font-bold text-red-800 dark:text-red-300">{error}</p><button onClick={fetchData} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Retry</button></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-7 border border-slate-800 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0f766e 100%)',
        }}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
              <BarChart3 className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Progress Analytics</h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
                Track your roadmap milestones, interview performance, skill mastery, and career match scores — all in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/70 border border-slate-700/60 backdrop-blur">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
              {DATE_RANGES.map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    dateRange === range
                      ? 'bg-emerald-500 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-lg"
                title="Print or save this page as PDF"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Roadmap Tasks Completed',
            value: `${totalRoadmapDone}`,
            sub: totalRoadmapAll > 0 ? `of ${totalRoadmapAll} total` : 'No tasks yet',
            trend: roadmapTrend,
            trendLabel: `${roadmapTrend}% complete`,
            color: PALETTE.emerald,
            icon: Target,
            badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
            badgeIcon: 'text-emerald-600 dark:text-emerald-400',
            delay: 0.02,
          },
          {
            label: 'Interviews Practiced',
            value: `${totalInterviews}`,
            sub: totalInterviews > 0 ? `Avg score: ${avgInterview}%` : 'Start practicing',
            trend: interviewAnalytics?.trend ?? 0,
            trendLabel: interviewAnalytics?.trend >= 0 ? `+${interviewAnalytics?.trend ?? 0} trend` : `${interviewAnalytics?.trend ?? 0} trend`,
            trendPositive: (interviewAnalytics?.trend ?? 0) >= 0,
            color: PALETTE.indigo,
            icon: Award,
            badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
            badgeIcon: 'text-indigo-600 dark:text-indigo-400',
            delay: 0.07,
          },
          {
            label: 'Skills Developed',
            value: `${skillsHave}`,
            sub: `${skillsPct}% match for target role`,
            trend: skillsPct,
            trendLabel: `${skillsPct}% readiness`,
            color: PALETTE.amber,
            icon: Zap,
            badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
            badgeIcon: 'text-amber-600 dark:text-amber-400',
            delay: 0.12,
          },
          {
            label: 'Profile Strength Score',
            value: null,
            ringPct: profilePct,
            sub: `${profileCompletion?.done ?? 0}/${profileCompletion?.total ?? 0} fields complete`,
            color: PALETTE.violet,
            icon: User,
            badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
            badgeIcon: 'text-violet-600 dark:text-violet-400',
            delay: 0.17,
            isRing: true,
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
            className="ns-card ns-card-hover p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.badgeBg}`}>
                <card.icon className={`w-5 h-5 ${card.badgeIcon}`} />
              </div>
              {card.isRing ? (
                <MiniRing pct={card.ringPct} color={card.color} />
              ) : card.trend !== undefined ? (
                <div className="flex items-center gap-1">
                  {card.trendPositive !== undefined ? (
                    card.trendPositive ? (
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                    )
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span className={`text-[10px] font-extrabold ${
                    card.trendPositive !== undefined
                      ? (card.trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {card.trendLabel}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {card.label}
              </span>
              {!card.isRing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: card.delay + 0.15 }}
                  className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mt-1"
                >
                  {card.value}
                </motion.div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                {card.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Roadmap Progress Timeline"
          subtitle="Milestone completion % across your career journey"
          delay={0.22}
        >
          {activityTimelineData.length === 0 ? (
            <NsEmpty
              icon={Target}
              title="Not enough data yet"
              body="Open the Career Roadmap and complete 3+ tasks to see your progress timeline."
              action={onNavigate && (
                <button
                  onClick={() => onNavigate('careerRoadmap')}
                  className="ns-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Open Roadmap <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            />
          ) : (
            <div style={containerBase}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTimelineData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridLine} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisText }} angle={-20} textAnchor="end" interval={0} height={50} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: axisText }} tickFormatter={v => `${v}%`} width={38} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, n, p) => [`${v}% (${p.payload.tasks} tasks)`, 'Progress']}
                    cursor={{ stroke: PALETTE.emerald, strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke={PALETTE.emerald}
                    strokeWidth={2.5}
                    fill="url(#gradEmerald)"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Interview Score Trend"
          subtitle="Performance across your recent mock interview sessions"
          delay={0.27}
        >
          {interviewTrendData.length < 2 ? (
            <NsEmpty
              icon={Award}
              title="Not enough data yet"
              body="Complete 2+ mock interviews to see your score trend over time."
              action={onNavigate && (
                <button
                  onClick={() => onNavigate('mockInterview')}
                  className="ns-btn bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
                >
                  Start Interview <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            />
          ) : (
            <div style={containerBase}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interviewTrendData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridLine} />
                  <XAxis dataKey="session" tick={{ fontSize: 10, fill: axisText }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: axisText }} tickFormatter={v => `${v}%`} width={38} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, n) => [`${v}%`, 'Score']}
                    cursor={{ stroke: PALETTE.indigo, strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={PALETTE.indigo}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PALETTE.indigo, strokeWidth: 2, stroke: isDark ? '#1e293b' : '#fff' }}
                    activeDot={{ r: 6, fill: PALETTE.indigo, stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={900}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Skill Match Breakdown"
          subtitle="Matching vs. missing skills for your target career"
          delay={0.32}
        >
          {skillMatchData.length === 0 ? (
            <NsEmpty
              icon={Sparkles}
              title="Not enough data yet"
              body="Add skills to your profile to see your match vs. missing skill breakdown."
              action={onNavigate && (
                <button
                  onClick={() => onNavigate('profile')}
                  className="ns-btn bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Edit Profile <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            />
          ) : (
            <>
              <div style={containerBase}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillMatchData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <GradientDefs />
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridLine} />
                    <XAxis type="number" domain={[0, 100]} tick={false} />
                    <YAxis type="category" dataKey="skill" tick={{ fontSize: 9.5, fill: axisText }} width={105} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v, n) => [v > 0 ? '✓ Matched' : '✗ Missing', n === 'match' ? 'Matched' : 'Missing']}
                      cursor={{ fill: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)' }}
                    />
                    <Bar dataKey="match" stackId="a" fill={PALETTE.emerald} radius={[0, 0, 0, 0]} animationDuration={700} />
                    <Bar dataKey="missing" stackId="a" fill={PALETTE.amber} radius={[0, 4, 4, 0]} animationDuration={700} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: PALETTE.emerald }} /> You have</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: PALETTE.amber }} /> Missing</span>
              </div>
            </>
          )}
        </ChartCard>

        <ChartCard
          title="Top 5 Career Match Scores"
          subtitle="How strongly your profile aligns with each career path"
          delay={0.37}
        >
          {careerMatchData.length === 0 ? (
            <NsEmpty
              icon={Briefcase}
              title="No career matches yet"
              body="Complete the RIASEC quiz and fill in your skills to generate match scores."
              action={onNavigate && (
                <button
                  onClick={() => onNavigate('riasec')}
                  className="ns-btn bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
                >
                  Take RIASEC Quiz <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            />
          ) : (
            <div style={containerBase}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={careerMatchData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridLine} />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: axisText }} angle={-20} textAnchor="end" interval={0} height={52} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: axisText }} tickFormatter={v => `${v}%`} width={38} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, n, p) => [`${v}% match`, p.payload.name]}
                    cursor={{ fill: isDark ? 'rgba(8,145,178,0.08)' : 'rgba(8,145,178,0.05)' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="url(#gradTeal)" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Activity Category Distribution"
          subtitle="Breakdown of tasks, interviews, applications & skills"
          delay={0.42}
        >
          {categoryData.length === 0 ? (
            <NsEmpty
              icon={Activity}
              title="No activity recorded yet"
              body="Start using roadmap, interviews, or job applications to see your activity breakdown."
            />
          ) : (
            <div style={containerBase}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={86}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={900}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke={isDark ? '#1e293b' : '#fff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10.5px', paddingTop: '8px' }}
                    formatter={(value) => <span style={{ color: axisText }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Academic Performance"
          subtitle="Matric, FSc / Inter, and entry test scores"
          delay={0.47}
        >
          {academicMarks.length === 0 ? (
            <NsEmpty
              icon={BookOpen}
              title="No marks recorded yet"
              body="Enter your Matric, FSc, and entry test scores in your profile to see your academic performance."
              action={onNavigate && (
                <button
                  onClick={() => onNavigate('profile')}
                  className="ns-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Add Marks <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            />
          ) : (
            <>
              <div style={containerBase}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={academicMarks} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                    <GradientDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridLine} />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: axisText }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: axisText }} tickFormatter={v => `${v}%`} width={38} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={v => [`${v}%`, 'Score']}
                      cursor={{ fill: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={800}>
                      {academicMarks.map((item, i) => (
                        <Cell key={i} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Matric</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />FSc</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />Entry Test</span>
              </div>
            </>
          )}
        </ChartCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
        className="ns-card ns-card-hover p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              Recent Activity
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Latest events across roadmaps, interviews, and job applications</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {recentActivity.length} events
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <NsEmpty
            icon={FileText}
            title="No recent activity"
            body="Your recent events (interviews, applications, task completions) will appear here."
          />
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6 px-6 pb-6">
            <table className="ns-table min-w-[520px]">
              <thead>
                <tr>
                  <th className="w-[22%]">Date</th>
                  <th className="w-[18%]">Type</th>
                  <th>Detail</th>
                  <th className="w-[18%] text-right">Metric</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((ev, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.56 + i * 0.03 }}
                  >
                    <td className="font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {ev.date === '—' ? ev.date : (typeof ev.date === 'string' ? ev.date.slice(0, 10) : '—')}
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.type === 'Interview'
                          ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                          : ev.type === 'Application'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                      }`}>
                        {ev.type}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-700 dark:text-slate-200 text-[12px]">
                      {ev.detail}
                    </td>
                    <td className={`text-right font-extrabold text-[12px] ${ev.metricColor || 'text-slate-700 dark:text-slate-200'}`}>
                      {ev.metric}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
