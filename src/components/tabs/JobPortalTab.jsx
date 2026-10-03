import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Bookmark, 
  ArrowRight,
  Clock,
  ExternalLink,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { JOBS_INTERNSHIPS_DATA } from '../../data/mockFullAppData.js';
import { JobListingSkeleton } from '../common/Skeletons.jsx';

const toJobListing = (job, index) => ({
  ...job,
  id: job?.id ?? `job-${index}`,
  title: job?.title || 'Career opportunity',
  company: job?.company || job?.organization || 'NexStep partner',
  type: job?.type || job?.employmentType || 'Opportunity',
  location: job?.location || 'Pakistan',
  stipendSalary: job?.stipendSalary || job?.salary || job?.salaryRange || job?.compensation || 'Compensation not listed',
  description: job?.description || 'Open opportunity details are available through the official listing.',
  requirements: Array.isArray(job?.requirements)
    ? job.requirements
    : Array.isArray(job?.qualifications)
      ? job.qualifications
      : Array.isArray(job?.keyRequirements)
        ? job.keyRequirements
        : Array.isArray(job?.skills)
          ? job.skills
          : [],
});

export function JobPortalTab({ profile, lang = 'en' }) {
  const [filterType, setFilterType] = useState('All'); // 'All', 'Full-Time', 'Internship'
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState(JOBS_INTERNSHIPS_DATA);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobsData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/jobs').then(res => res.json()).catch(() => null),
      fetch('/api/applications').then(res => res.json()).catch(() => null),
      fetch('/api/bookmarks').then(res => res.json()).catch(() => null)
    ]).then(([resData, appsData, bmsData]) => {
      if (Array.isArray(resData?.data) && resData.data.length > 0) {
        // API listings do not always include every optional presentation field.
        // Normalising them keeps the cards safe while retaining their real data.
        setJobs(resData.data.map(toJobListing));
      }
      if (Array.isArray(appsData?.data)) {
        setAppliedJobIds(appsData.data.map(a => a.targetId || a.id));
      }
      if (Array.isArray(bmsData?.data)) {
        setSavedJobIds(bmsData.data.map(b => b.id));
      }
    }).finally(() => {
      // Small smooth timeout for skeleton effect
      setTimeout(() => setIsLoading(false), 600);
    });
  };

  // Fetch jobs, applications, and bookmarks from backend REST API
  useEffect(() => {
    fetchJobsData();
  }, []);

  const filtered = jobs.map(toJobListing).filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || j.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleApply = (job) => {
    if (!appliedJobIds.includes(job.id)) {
      setAppliedJobIds(prev => [...prev, job.id]);
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: job.id,
          title: job.title,
          targetName: job.company,
          type: 'Job / Internship',
          officialUrl: job.officialUrl
        })
      }).catch(e => console.error(e));
    }
  };

  const handleToggleSave = (job) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(prev => prev.filter(i => i !== job.id));
      fetch(`/api/bookmarks/${job.id}`, { method: 'DELETE' }).catch(e => console.error(e));
    } else {
      setSavedJobIds(prev => [...prev, job.id]);
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          type: 'job',
          title: job.title,
          provider: job.company,
          officialUrl: job.officialUrl
        })
      }).catch(e => console.error(e));
    }
  };

  if (isLoading) {
    return <JobListingSkeleton count={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Graduate Job & Internship Opportunities</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Top Tech, Finance & Engineering roles tailored for fresh graduates</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobsData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            title="Simulate Data Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl text-xs font-semibold">
            {['All', 'Full-Time', 'Internship'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === t ? 'bg-emerald-500 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search jobs, internships, companies, or technologies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Job Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((job) => {
          const isApplied = appliedJobIds.includes(job.id);
          const isSaved = savedJobIds.includes(job.id);

          return (
            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold text-[10px]">
                      {job.type}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{job.company}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {job.sourceName || 'Pakistan National Career & Opportunity Registry'} • {job.verificationStatus || 'VERIFIED'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSave(job)}
                    className={`p-2 rounded-xl border ${
                      isSaved ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{job.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">{job.stipendSalary}</span>
                </div>

                {/* Requirements */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Key Requirements:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements.map((req, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                        {req}
                      </span>
                    ))}
                    {job.requirements.length === 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">See official listing for requirements</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {job.officialUrl ? (
                  <a
                    href={job.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <span>Official Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Apply before: {job.deadline}</span>
                )}

                <button
                  onClick={() => handleApply(job)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isApplied
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Application Submitted</span>
                    </>
                  ) : (
                    <>
                      <span>Quick Apply with Resume</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
