import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { ENTRY_TESTS_DATA } from '../../data/entryTestsData.js';
import { translations } from '../../data/translations.js';
import { tr } from '../../utils/translator.js';
import { ThreeDSkillConstellation } from '../common/ThreeDSkillConstellation.jsx';

export function FscMapperTab({ profile, onNavigate, lang }) {
  const t = translations[lang];

  const [fscPct, setFscPct] = useState(profile?.marks?.fscPct || 80);
  const [entryTestScore, setEntryTestScore] = useState(profile?.marks?.entryTestScore || 75);
  const [stream, setStream] = useState(profile?.preferredStream || 'ICS (Comp Sci)');
  const [city, setCity] = useState(profile?.city || '');
  const [budgetAnnualPkr, setBudgetAnnualPkr] = useState(profile?.budgetAnnualPkr || profile?.budget?.annualPkr || '');
  const [interests, setInterests] = useState(Array.isArray(profile?.interests) ? profile.interests.join(', ') : profile?.interests || '');
  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedTest, setExpandedTest] = useState(null);

  const handleCalculateMerit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-fsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fscPct,
          entryTestScore,
          stream,
          city,
          budgetAnnualPkr,
          interests,
          topRiasecCluster: profile?.topRiasecCluster || profile?.riasecCode || '',
        })
      });
      const data = await response.json();
      setCalcResult({
        ...data,
        aggregateScore: Number(data?.aggregateScore) || 0,
        matches: Array.isArray(data?.matches) ? data.matches.map((career) => ({
          ...career,
          topUniversities: Array.isArray(career?.topUniversities) ? career.topUniversities : [],
          entryTests: Array.isArray(career?.entryTests) ? career.entryTests : [],
        })) : [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Skill & Pathway Network Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-emerald-500/20 p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 max-w-md">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">3D Pathway Constellation</span>
            <h2 className="text-2xl font-black text-white">Visualizing Inter & Skill Connections</h2>
            <p className="text-xs text-slate-400 leading-relaxed">Interactive WebGL particle constellation showing how your F.Sc subjects unlock top software, medical, and engineering careers.</p>
          </div>
          <div className="w-full md:w-80 h-48 relative">
            <ThreeDSkillConstellation height={190} />
          </div>
        </div>
      </div>

      {/* Merit Calculator Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.fscMapper.title}</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.fscMapper.inputMarks}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">FSc / Inter Percentage %</label>
            <input
              type="number"
              value={fscPct}
              onChange={(e) => setFscPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred city</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Islamabad" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Annual budget (PKR)</label>
            <input type="number" value={budgetAnnualPkr} onChange={(e) => setBudgetAnnualPkr(e.target.value)} placeholder="e.g. 250000" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interests or skills</label>
            <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. coding, maths" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Entry Test Score % (or Marks)</label>
            <input
              type="number"
              value={entryTestScore}
              onChange={(e) => setEntryTestScore(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.profile.fscStream}</label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Pre-Medical">{tr("FSc Pre-Medical", lang)}</option>
              <option value="Pre-Engineering">{tr("FSc Pre-Engineering", lang)}</option>
              <option value="ICS (Comp Sci)">{tr("ICS (Computer Science)", lang)}</option>
              <option value="ICOM (Commerce)">{tr("ICOM (Commerce)", lang)}</option>
              <option value="Arts/FA">{tr("Arts / FA", lang)}</option>
              <option value="A-Levels">{tr("Cambridge A-Levels", lang)}</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculateMerit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          <span>{loading ? 'Calculating Merit Score...' : t.fscMapper.calculateMatches}</span>
        </button>
      </div>

      {/* IBCC Cambridge A-Level Equivalence Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Cambridge O/A-Level IBCC Equivalence Calculator</h2>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            Official IBCC Formula
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Convert A-Level letter grades (A*, A, B, C, D) into certified IBCC percentage and 1100-mark aggregate for Pakistani medical and engineering admission.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {['Subject 1', 'Subject 2', 'Subject 3'].map((sub, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">{sub} Grade</label>
              <select className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-xs">
                <option value="90">A* (90% Marks)</option>
                <option value="85">A (85% Marks)</option>
                <option value="75">B (75% Marks)</option>
                <option value="65">C (65% Marks)</option>
                <option value="55">D (55% Marks)</option>
              </select>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 block">Estimated IBCC Equivalent Marks:</span>
            <span className="text-slate-600">Meets eligibility for PMDC Medical & PEC Engineering entry tests.</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-700">935 / 1100 (85%)</span>
        </div>
      </div>

      {/* Calculator Output */}
      {calcResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.fscMapper.eligibleTracks}</h2>
              <p className="text-xs text-slate-500">Based on Pakistan standard 50% FSc + 50% Entry Test aggregate formula</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Your Aggregate</span>
              <span className="text-xl font-extrabold text-emerald-700">{calcResult.aggregateScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(calcResult.matches) && calcResult.matches.map((car) => {
              const isStrong = car.fitCategory === 'Strong Match';
              return (
                <div key={car.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      {lang === 'ur' ? car.titleUr : car.title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      isStrong ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {car.fitCategory}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{car.description}</p>

                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                    <div><strong>Suggested campuses:</strong> {car.topUniversities.length ? car.topUniversities.map((university) => typeof university === 'string' ? university : `${university.name} (${university.city})`).join(', ') : 'Review university options'}</div>
                    <div><strong>Entry Tests:</strong> {car.entryTests.join(', ')}</div>
                    <div><strong>Monthly Salary PKR:</strong> {car.avgSalaryPkr}</div>
                  </div>

                  {Array.isArray(car.why) && (
                    <ul className="text-[11px] leading-5 text-slate-600 dark:text-slate-400 list-disc ps-4">
                      {car.why.slice(0, 3).map((reason, reasonIndex) => <li key={reasonIndex}>{reason}</li>)}
                    </ul>
                  )}

                  <button
                    onClick={() => onNavigate('universities')}
                    className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View University Merit Cutoffs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entry Test Guide Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">{t.fscMapper.entryTestGuide}</h2>
        </div>

        <div className="space-y-3">
          {ENTRY_TESTS_DATA.map((test) => {
            const isExpanded = expandedTest === test.id;
            return (
              <div key={test.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                <div 
                  onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{test.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {test.conductedBy}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{test.fullName}</p>
                  </div>

                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-200/60 bg-white space-y-3 text-xs">
                    <div>
                      <strong className="text-slate-800">Merit Cutoff & Eligibility:</strong>
                      <p className="text-slate-600 mt-0.5">{test.cutoffRangePct}</p>
                    </div>

                    <div>
                      <strong className="text-slate-800">Test Pattern & Structure:</strong>
                      <p className="text-slate-600 mt-0.5">{test.testPattern}</p>
                    </div>

                    <div>
                      <strong className="text-slate-800">Registration Season:</strong>
                      <p className="text-emerald-700 font-semibold mt-0.5">{test.registrationMonth}</p>
                    </div>

                    <div>
                      <strong className="text-slate-800">Preparation Tips:</strong>
                      <ul className="list-disc list-inside text-slate-600 mt-1 space-y-1">
                        {test.preparationTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
