import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Search, 
  GraduationCap, 
  DollarSign, 
  CheckCircle2,
  ArrowRightLeft,
  Grid
} from 'lucide-react';
import { CAREERS_DATA } from '../../data/careersData.js';
import { translations } from '../../data/translations.js';
import { CareerComparisonTool } from '../career/CareerComparisonTool.jsx';

export function DegreeCareerTab({ lang }) {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState('compare'); // Default to 'compare' as requested
  const [search, setSearch] = useState('');

  const filtered = CAREERS_DATA.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.titleUr.includes(q) ||
      c.streamRequired.toLowerCase().includes(q) ||
      c.jobTitles.some(j => j.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & View Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.degreeCareer.title}</h1>
              <p className="text-xs text-slate-500">{t.degreeCareer.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'compare'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Career Comparison Tool</span>
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Careers Directory</span>
            </button>
          </div>
        </div>

        {viewMode === 'directory' && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by degree name, job title, or stream..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Content Rendering */}
      {viewMode === 'compare' ? (
        <CareerComparisonTool lang={lang} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((car) => (
            <div key={car.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {lang === 'ur' ? car.titleUr : car.title}
                    </h3>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                      {car.streamRequired}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                    {car.demandLevel} Demand
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{car.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-1.5">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Job Roles in Industry:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {car.jobTitles.map((j, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                          {j}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>Starting Monthly Salary (PKR):</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{car.avgSalaryPkr}</strong>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <strong>Top Universities:</strong> {car.topUniversities.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DegreeCareerTab;
