import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Briefcase, Users, Plus, CheckCircle2,
  Calendar, X, Clock, Video, Phone, Loader2,
  RefreshCw, AlertCircle, TrendingUp, Edit2, Trash2
} from 'lucide-react';

// ── Schedule Modal ────────────────────────────────────────────────────────────
function ScheduleModal({ applicant, jobId, onClose, onConfirm }) {
  const [date, setDate]           = useState('');
  const [time, setTime]           = useState('');
  const [mode, setMode]           = useState('Video Call');
  const [notes, setNotes]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return;
    setLoading(true);
    setError('');
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await fetch('/api/recruiter/interviews', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: applicant.student_id, jobId, scheduledAt, mode, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule.');
      setSubmitted(true);
      onConfirm({ applicant: applicant.student_name, date, time, mode });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Interview Scheduled</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{applicant.student_name} · {mode} · {date} at {time}</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Schedule Interview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Candidate: <strong>{applicant.student_name}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)} required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mode</label>
            <div className="flex gap-2">
              {['Video Call','Phone Call','In-Person'].map(m=>(
                <button key={m} type="button" onClick={()=>setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold border cursor-pointer transition-all ${mode===m?'bg-emerald-600 text-white border-emerald-600':'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
            <textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="e.g. Technical round — focus on DS&A"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling…</> : <><Calendar className="w-3.5 h-3.5" /> Confirm</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function RecruiterPortalTab() {
  const [activeSubView, setActiveSubView] = useState('jobs');
  const [jobs, setJobs]             = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [schedulingFor, setSchedulingFor] = useState(null);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [jobTitle, setJobTitle]     = useState('');
  const [company, setCompany]       = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, appRes, statsRes] = await Promise.all([
        fetch('/api/recruiter/jobs',       { credentials: 'include' }),
        fetch('/api/recruiter/applicants', { credentials: 'include' }),
        fetch('/api/recruiter/stats',      { credentials: 'include' }),
      ]);
      if (jobsRes.ok)   { const d = await jobsRes.json();   setJobs(Array.isArray(d.data) ? d.data : []); }
      if (appRes.ok)    { const d = await appRes.json();    setApplicants(Array.isArray(d.data) ? d.data : []); }
      if (statsRes.ok)  { const d = await statsRes.json();  setStats(d.data      ?? null); }
    } catch { setError('Failed to load recruiter data.'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobTitle || !company) return;
    setPostLoading(true);
    try {
      const res = await fetch('/api/recruiter/jobs', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle, company }),
      });
      if (res.ok) {
        setPostedSuccess(true);
        setJobTitle(''); setCompany('');
        load();
      }
    } catch {}
    setPostLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        {[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
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
      {schedulingFor && (
        <ScheduleModal
          applicant={schedulingFor}
          jobId={schedulingFor.job_id}
          onClose={() => setSchedulingFor(null)}
          onConfirm={(data) => { setScheduledItems(prev => [data, ...prev]); }}
        />
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Recruiter Portal</h1>
            <p className="text-xs text-slate-400">Post jobs · Review applicants · Schedule interviews</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl text-xs font-semibold">
            {[['jobs','Jobs'],['applicants','Applicants'],['post','+ Post Job']].map(([v,l])=>(
              <button key={v} onClick={()=>setActiveSubView(v)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeSubView===v?'bg-emerald-500 text-white font-bold':'text-slate-300 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs',     value: stats?.active_jobs        ?? 0 },
          { label: 'Total Jobs',      value: stats?.total_jobs         ?? 0 },
          { label: 'Applicants',      value: stats?.total_applicants   ?? 0 },
          { label: 'Interviews',      value: stats?.interviews_scheduled ?? 0 },
        ].map((s,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">{s.label}</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-1">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Jobs tab */}
      {activeSubView === 'jobs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Job Postings ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No job postings yet. Click "+ Post Job" to create one.</p>
            </div>
          ) : jobs.map(j => (
            <div key={j.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{j.title}</h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{j.company} · {j.type} · {j.applicant_count} applicants</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${j.is_active?'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300':'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {j.is_active ? 'Active' : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Applicants tab */}
      {activeSubView === 'applicants' && (
        <div className="space-y-4">
          {scheduledItems.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-5 space-y-3">
              <h3 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Scheduled Interviews ({scheduledItems.length})
              </h3>
              {scheduledItems.map((s,i)=>(
                <div key={i} className="flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>{s.applicant}</strong> — {s.mode} · {s.date} at {s.time}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Applicant Pipeline ({applicants.length})</h2>
            {applicants.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No applicants yet.</p>
              </div>
            ) : applicants.map((a,idx)=>(
              <div key={a.id || idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{a.student_name}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{a.student_email} · Applied for: {a.job_title} · Status: {a.status}</span>
                </div>
                <button onClick={()=>setSchedulingFor(a)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                  <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Job tab */}
      {activeSubView === 'post' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Post New Job Opening</h2>
          {postedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Job listing published to student portal!
            </div>
          )}
          <form onSubmit={handlePostJob} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
              <input type="text" value={jobTitle} onChange={e=>setJobTitle(e.target.value)}
                placeholder="e.g. Associate Software Engineer" required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input type="text" value={company} onChange={e=>setCompany(e.target.value)}
                placeholder="e.g. Systems Limited" required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button type="submit" disabled={postLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-2">
              {postLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing…</> : 'Publish Job'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
