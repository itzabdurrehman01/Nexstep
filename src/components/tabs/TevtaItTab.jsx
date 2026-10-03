import React, { useState } from 'react';
import { 
  Wrench, 
  Laptop, 
  CheckCircle2, 
  ExternalLink, 
  Award, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { TEVTA_COURSES, FREE_IT_COURSES } from '../../data/tevtaAndItData.js';
import { translations } from '../../data/translations.js';

export function TevtaItTab({ lang }) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('tevta'); // 'tevta' or 'freeIt'

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t.tevtaIt.title}</h1>
            <p className="text-xs text-slate-500">{t.tevtaIt.subtitle}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('tevta')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tevta'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.tevtaIt.tevtaTab}
          </button>

          <button
            onClick={() => setActiveTab('freeIt')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'freeIt'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.tevtaIt.itCertTab}
          </button>
        </div>
      </div>

      {activeTab === 'tevta' ? (
        /* TEVTA Vocational Trade Diplomas */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TEVTA_COURSES.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {course.field}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.institute}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 shrink-0">{course.durationMonths} Months</span>
                </div>

                <p className="text-xs text-slate-600">{course.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div><strong>Min Entry Requirement:</strong> {course.minQualification}</div>
                  <div><strong>Target Profession:</strong> {course.targetCareer}</div>
                  <div><strong>Overseas Placement Demand:</strong> <span className="text-emerald-700 font-bold">Gulf & EU Technical Visa Eligible</span></div>
                  <div><strong>Starting Salary Scale:</strong> PKR 60,000 - 180,000 / month</div>
                  {course.monthlyStipendPkr && (
                    <div><strong>Govt Monthly Stipend:</strong> <span className="text-emerald-700 font-bold">PKR {course.monthlyStipendPkr.toLocaleString()} / month (Free Course)</span></div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>Available at PBTE & TEVTA Institutes Across Pakistan</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Govt Certified</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Free Certified IT & Digital Skills */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FREE_IT_COURSES.map((cert) => (
            <div key={cert.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {t.tevtaIt.freeBadge}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{cert.title}</h3>
                    <p className="text-xs text-slate-500">{cert.provider}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 shrink-0">{cert.level}</span>
                </div>

                <p className="text-xs text-slate-600">{cert.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div><strong>Skills Taught:</strong> {cert.skillFocus}</div>
                  <div><strong>Duration:</strong> ~{cert.durationHrs} Hours Self-Paced</div>
                  <div><strong>Certification Type:</strong> <span className="text-emerald-700 font-bold">{cert.certificateType}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">100% Free Access</span>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <span>Start Learning</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
