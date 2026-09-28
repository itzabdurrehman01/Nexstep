import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Award,
  Filter,
  Search,
  Bookmark
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

  useEffect(() => {
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
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.scholarships?.title || 'Scholarships Directory'}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.scholarships?.subtitle || 'Matched to your household income and province'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{lang === 'ur' ? 'صوبہ / علاقہ' : 'Province / Region'}</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="All">All Categories</option>
              <option value="Need-Based">Need Based</option>
              <option value="Merit-Based">Merit Based</option>
              <option value="Provincial">Provincial</option>
              <option value="Federal">Federal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Income Criteria</label>
            <div className="pt-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              Matching household income: PKR {(Number(profile.familyMonthlyIncomePkr) || 0).toLocaleString()} / mo
            </div>
          </div>
        </div>
      </div>

      {/* Scholarship Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {scholarships.map(toScholarship).map((sch) => {
          const isBookmarked = bookmarkedIds.includes(sch.id);
          return (
            <div key={sch.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3 flex flex-col justify-between transition-colors">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {sch.category}
                    </span>
                    {sch.eligibility && (
                      <span className={`ms-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        sch.eligibilityScore >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {sch.eligibility}
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{sch.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sch.provider}</p>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        {sch.sourceName || 'National Scholarship & Endowment Fund'} • {sch.verificationStatus || 'VERIFIED'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleBookmark(sch)}
                      title={isBookmarked ? "Saved to Bookmarks" : "Save Bookmark"}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked 
                          ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{sch.province}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{sch.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div><strong className="text-slate-900 dark:text-white">Award Value:</strong> <span className="text-emerald-700 dark:text-emerald-400 font-bold">{sch.awardAmountPkr}</span></div>
                  <div><strong className="text-slate-900 dark:text-white">Max Household Income:</strong> PKR {sch.maxFamilyIncomePkr.toLocaleString()}/mo</div>
                  <div><strong className="text-slate-900 dark:text-white">Min Marks Needed:</strong> {sch.minAcademicPct}%</div>
                  <div><strong className="text-slate-900 dark:text-white">Deadline:</strong> <span className="text-amber-700 dark:text-amber-400 font-bold">{sch.deadline}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Eligible: {sch.eligibleGrades ? sch.eligibleGrades.join(', ') : 'All Students'}</span>
                <a
                  href={sch.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
