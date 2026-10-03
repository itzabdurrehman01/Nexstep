import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Award,
  Filter,
  Search,
  Bookmark,
  AlertTriangle,
  PiggyBank
} from 'lucide-react';
import { SCHOLARSHIPS_DATA } from '../../data/scholarshipsData.js';
import { translations } from '../../data/translations.js';

const toScholarship = (scholarship, index) => ({
  ...scholarship,
  id: scholarship?.id ?? `scholarship-${index}`,
  title: scholarship?.title || scholarship?.name || 'Scholarship opportunity',
  provider: scholarship?.provider || 'NexStep partner',
  category: scholarship?.category || 'Merit-Based',
  province: scholarship?.province || 'Pakistan',
  description: scholarship?.description || 'See the official portal for eligibility and application details.',
  awardAmountPkr: scholarship?.awardAmountPkr || scholarship?.amountPkr || 'Award not listed',
  maxFamilyIncomePkr: Number(scholarship?.maxFamilyIncomePkr) || 0,
  minAcademicPct: Number(scholarship?.minAcademicPct) || 0,
  eligibleGrades: Array.isArray(scholarship?.eligibleGrades) ? scholarship.eligibleGrades : [],
  applicationUrl: scholarship?.applicationUrl || scholarship?.officialUrl || '#',
  eligibilityScore: Number(scholarship?.eligibilityScore) || 0,
  eligibility: scholarship?.eligibility || '',
});

export function ScholarshipsTab({ profile = {}, lang }) {
  const t = translations[lang] || translations.en;

  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [scholarships, setScholarships] = useState(SCHOLARSHIPS_DATA);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setFetchError(null);
    fetch('/api/scholarships/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyMonthlyIncomePkr: profile?.familyMonthlyIncomePkr || profile?.income,
        academicPct: profile?.marks?.fscPct || profile?.marks?.matricPct,
        province: selectedProvince === 'All' ? profile?.province || profile?.city : selectedProvince,
        gradeLevel: profile?.gradeLevel,
      }),
    })
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData?.data)) {
          setScholarships(resData.data
            .map(toScholarship)
            .filter((scholarship) => selectedCategory === 'All' || scholarship.category.toLowerCase() === selectedCategory.toLowerCase()));
        }
      })
      .catch(() => {
        setFetchError('Live matching engine unavailable. Showing curated Pakistan scholarship listings.');
        const filtered = SCHOLARSHIPS_DATA.filter((sch) => {
          if (selectedProvince !== 'All' && !(sch.province || '').includes(selectedProvince) && !(sch.province || '').includes('Federal')) return false;
          if (selectedCategory !== 'All' && (sch.category || '').toLowerCase() !== selectedCategory.toLowerCase()) return false;
          if ((profile?.familyMonthlyIncomePkr || 0) > sch.maxFamilyIncomePkr && sch.category === 'Need-Based') return false;
          return true;
        });
        setScholarships(filtered);
      });
  }, [selectedProvince, selectedCategory, profile]);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data)) {
          setBookmarkedIds(data.data.map(b => b.id));
        }
      })
      .catch(err => console.log(err));
  }, []);

  const handleBookmark = (sch) => {
    const isBookmarked = bookmarkedIds.includes(sch.id);
    if (isBookmarked) {
      setBookmarkedIds(prev => prev.filter(id => id !== sch.id));
      fetch(`/api/bookmarks/${sch.id}`, { method: 'DELETE' }).catch(e => console.error(e));
    } else {
      setBookmarkedIds(prev => [...prev, sch.id]);
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sch.id,
          type: 'scholarship',
          title: sch.title,
          provider: sch.provider,
          officialUrl: sch.applicationUrl
        })
      }).catch(e => console.error(e));
    }
  };

  return (
    <div className="ns-page-wrapper space-y-6 min-w-0">
      <div className="relative overflow-hidden ns-card p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl ns-accent-glow-right" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="relative z-10 space-y-5 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <Award className="w-7 h-7" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>{scholarships.length} Matched Scholarships</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {t.scholarships?.title || 'Scholarships Directory'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {t.scholarships?.subtitle || 'Matched to your household income, academic marks, and province — for Pakistani students'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
            <div>
              <label className="ns-input-label" htmlFor="sch-province">{lang === 'ur' ? 'صوبہ / علاقہ' : 'Province / Region'}</label>
              <select
                id="sch-province"
                aria-label="Filter scholarships by province or region"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="ns-select"
              >
                <option value="All">All Provinces</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="KPK">KPK</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Federal">Islamabad (Federal)</option>
              </select>
            </div>

            <div>
              <label className="ns-input-label" htmlFor="sch-category">Category</label>
              <select
                id="sch-category"
                aria-label="Filter scholarships by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="ns-select"
              >
                <option value="All">All Categories</option>
                <option value="Need-Based">Need Based</option>
                <option value="Merit-Based">Merit Based</option>
                <option value="Provincial">Provincial</option>
                <option value="Federal">Federal</option>
              </select>
            </div>

            <div>
              <label className="ns-input-label">Household Income Match</label>
              <div className="ns-select pointer-events-none flex items-center" aria-hidden="false">
                <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="ml-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 truncate">
                  PKR {(Number(profile.familyMonthlyIncomePkr) || 0).toLocaleString()} / month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {fetchError && (
          <motion.div
            key="sch-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="ns-alert ns-alert-info"
            role="status"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{fetchError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {scholarships.length === 0 ? (
          <motion.div
            key="sch-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
          >
            <div className="ns-empty">
              <div className="ns-empty-icon">
                <GraduationCap className="w-9 h-9" strokeWidth={1.8} />
              </div>
              <h3 className="ns-empty-title">No scholarships match your profile</h3>
              <p className="ns-empty-desc">
                Try switching to "All Provinces" or "All Categories" to see more federal and nationwide opportunities.
              </p>
              <div className="ns-empty-actions">
                <button
                  onClick={() => { setSelectedProvince('All'); setSelectedCategory('All'); }}
                  className="ns-btn ns-btn-secondary ns-btn-sm"
                >
                  Expand Filters
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sch-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0"
          >
            {scholarships.map(toScholarship).map((sch, idx) => {
              const isBookmarked = bookmarkedIds.includes(sch.id);
              const isEligible = sch.eligibilityScore >= 80;
              return (
                <motion.article
                  key={sch.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut', delay: idx * 0.04 } }
                  }}
                  className="ns-card ns-card-hover p-5 space-y-4 flex flex-col justify-between min-w-0"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`ns-badge ${
                            sch.category === 'Need-Based' ? 'ns-badge-warning' :
                            sch.category === 'Merit-Based' ? 'ns-badge-match' :
                            sch.category === 'Federal' ? 'ns-badge-info' : 'ns-badge-ai'
                          }`}>
                            {sch.category}
                          </span>
                          {sch.eligibility && (
                            <span className={`ns-badge ${isEligible ? 'ns-badge-success' : 'ns-badge-warning'}`}>
                              {sch.eligibility}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate">
                          {sch.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{sch.provider}</span>
                          <span className="ns-badge ns-badge-match">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{sch.sourceName || 'National Scholarship Fund'} • {sch.verificationStatus || 'VERIFIED'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleBookmark(sch)}
                          aria-label={isBookmarked ? "Remove from saved bookmarks" : "Save bookmark"}
                          aria-pressed={isBookmarked}
                          className={`p-1.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                            isBookmarked
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                          }`}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {sch.description}
                    </p>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">Award Value:</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 truncate">{sch.awardAmountPkr}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">Max Household Income:</span>
                        <span className="font-semibold truncate">PKR {sch.maxFamilyIncomePkr.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">Min Marks Needed:</span>
                        <span className="font-semibold">{sch.minAcademicPct}%</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5" /> Deadline:
                        </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400 truncate">{sch.deadline || 'Rolling'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400 min-w-0 truncate">
                      Eligible: {sch.eligibleGrades ? sch.eligibleGrades.join(', ') : 'All Students'}
                    </span>
                    <a
                      href={sch.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Apply for ${sch.title} on the official portal`}
                      className="ns-btn ns-btn-primary ns-btn-sm inline-flex items-center gap-1.5"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
