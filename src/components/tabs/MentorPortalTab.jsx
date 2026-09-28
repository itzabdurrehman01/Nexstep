import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Calendar, Video, CheckCircle2, Clock,
  X, Copy, Monitor, Info, Loader2, RefreshCw,
  TrendingUp, BookOpen, Star, AlertCircle
} from 'lucide-react';

// ── Session Launch Panel ──────────────────────────────────────────────────────
function SessionLaunchPanel({ session, onClose }) {
  const [copied, setCopied] = useState(false);
  const meetingLink = session.meeting_link ||
    `https://meet.nexstep.pk/session-${(session.student_name||'student').toLowerCase().replace(/\s+/g,'-')}-${Date.now().toString(36)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Start Session with {session.student_name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {session.topic} · {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span>Live video calling requires a conferencing integration (Jitsi/Zoom). Share the meeting link below with your mentee.</span>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Session Meeting Link</label>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="flex-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">{meetingLink}</span>
            <button onClick={handleCopy}
              className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                copied ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                       : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}>
              {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Close
          </button>
          <a href={meetingLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" /> Open Meeting Room
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function MentorPortalTab() {
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessRes, studRes, statsRes, profRes] = await Promise.all([
        fetch('/api/mentor/sessions',  { credentials: 'include' }),
        fetch('/api/mentor/students',  { credentials: 'include' }),
        fetch('/api/mentor/stats',     { credentials: 'include' }),
        fetch('/api/mentor/profile',   { credentials: 'include' }),
      ]);
      if (sessRes.ok)  { const d = await sessRes.json();  setSessions(Array.isArray(d.data) ? d.data : []); }
      if (studRes.ok)  { const d = await studRes.json();  setStudents(Array.isArray(d.data) ? d.data : []); }
      if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data     ?? null); }
      if (profRes.ok)  { const d = await profRes.json();  setProfile(d.data   ?? null); }
    } catch (err) {
      setError('Failed to load mentor data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const pastSessions     = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-sm font-bold text-red-800 dark:text-red-300">{error}</p>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeSession && <SessionLaunchPanel session={activeSession} onClose={() => setActiveSession(null)} />}

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Mentor Dashboard</h1>
            <p className="text-xs text-slate-400">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Mentor'} · Verified Faculty
            </p>
          </div>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions',    value: stats?.total_sessions    ?? 0, color: 'text-slate-900 dark:text-white' },
          { label: 'Upcoming',          value: stats?.upcoming_sessions ?? 0, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Completed',         value: stats?.completed_sessions ?? 0, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Mentees',     value: stats?.total_mentees     ?? 0, color: 'text-purple-600 dark:text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">{s.label}</span>
            <span className={`text-2xl font-extrabold block mt-1 ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        {[['sessions','Sessions'],['students','Mentees']].map(([v,l]) => (
          <button key={v} onClick={() => setActiveTab(v)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeTab===v?'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white':'text-slate-600 dark:text-slate-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {upcomingSessions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Upcoming Sessions ({upcomingSessions.length})</h2>
              {upcomingSessions.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {s.student_name} <span className="text-slate-400 font-normal">({s.student_grade || 'Student'})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {s.topic} · <Clock className="w-3 h-3 inline" /> {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <button onClick={() => setActiveSession(s)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-emerald-600/20">
                    <Video className="w-3.5 h-3.5" /> Start Session
                  </button>
                </div>
              ))}
            </div>
          )}
          {upcomingSessions.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No upcoming sessions</p>
              <p className="text-xs text-slate-400">Students can book sessions through the Mentorship tab.</p>
            </div>
          )}
          {pastSessions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Past Sessions ({pastSessions.length})</h2>
              {pastSessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.student_name}</span>
                    <span className="text-[11px] text-slate-500 block">{s.topic}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.status==='completed'?'bg-emerald-100 text-emerald-800':'bg-slate-200 text-slate-600'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students tab */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Your Mentees ({students.length})</h2>
          {students.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No mentee sessions yet.</p>
            </div>
          ) : students.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</span>
                <span className="text-[11px] text-slate-500 block">{s.email} · {s.grade_level || 'Student'}</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{s.session_count} sessions</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
