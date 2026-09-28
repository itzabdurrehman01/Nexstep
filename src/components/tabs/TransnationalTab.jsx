import React, { useState } from 'react';
import { 
  Globe, 
  Calculator, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink,
  Award
} from 'lucide-react';
import { TRANSNATIONAL_PATHWAYS } from '../../data/transnationalData.js';
import { translations } from '../../data/translations.js';

export function TransnationalTab({ lang }) {
  const t = translations[lang];

  // IBCC Grade Converter State
  const [aGrades, setAGrades] = useState({ sub1: 'A*', sub2: 'A', sub3: 'B' });
  const [oPct, setOPct] = useState(85);
  const [convertedScore, setConvertedScore] = useState(null);

  const gradeValues = {
    'A*': 90,
    'A': 85,
    'B': 75,
    'C': 65,
    'D': 55,
    'E': 45,
  };

  const handleCalculateIbcc = () => {
    const s1 = gradeValues[aGrades.sub1] || 75;
    const s2 = gradeValues[aGrades.sub2] || 75;
    const s3 = gradeValues[aGrades.sub3] || 75;

    const avgA = (s1 + s2 + s3) / 3;
    // 60% A-Levels + 40% O-Levels IBCC aggregate formula
    const finalPct = (avgA * 0.6) + (oPct * 0.4);

    setConvertedScore(finalPct.toFixed(1));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t.transnational.title}</h1>
            <p className="text-xs text-slate-500">{t.transnational.subtitle}</p>
          </div>
        </div>
      </div>

      {/* IBCC Equivalency Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{t.transnational.calcTitle}</h2>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            IBCC Scale
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Select your 3 Principal A-Level grades and estimated O-Level percentage to calculate your official IBCC equivalent score out of 1100 marks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject 1 Grade</label>
            <select
              value={aGrades.sub1}
              onChange={(e) => setAGrades({ ...aGrades, sub1: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
            >
              <option value="A*">A* (90% IBCC)</option>
              <option value="A">A (85% IBCC)</option>
              <option value="B">B (75% IBCC)</option>
              <option value="C">C (65% IBCC)</option>
              <option value="D">D (55% IBCC)</option>
              <option value="E">E (45% IBCC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject 2 Grade</label>
            <select
              value={aGrades.sub2}
              onChange={(e) => setAGrades({ ...aGrades, sub2: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
            >
              <option value="A*">A* (90% IBCC)</option>
              <option value="A">A (85% IBCC)</option>
              <option value="B">B (75% IBCC)</option>
              <option value="C">C (65% IBCC)</option>
              <option value="D">D (55% IBCC)</option>
              <option value="E">E (45% IBCC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject 3 Grade</label>
            <select
              value={aGrades.sub3}
              onChange={(e) => setAGrades({ ...aGrades, sub3: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
            >
              <option value="A*">A* (90% IBCC)</option>
              <option value="A">A (85% IBCC)</option>
              <option value="B">B (75% IBCC)</option>
              <option value="C">C (65% IBCC)</option>
              <option value="D">D (55% IBCC)</option>
              <option value="E">E (45% IBCC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">O-Level Equiv %</label>
            <input
              type="number"
              value={oPct}
              onChange={(e) => setOPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <button
          onClick={handleCalculateIbcc}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          <span>Calculate IBCC Score</span>
        </button>

        {convertedScore && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-bold">
            <span>Estimated IBCC FSc Equivalent Aggregate Score:</span>
            <span className="text-lg text-emerald-800 font-extrabold">{convertedScore}% (approx. {Math.round(convertedScore * 11)} / 1100)</span>
          </div>
        )}
      </div>

      {/* Pathways Detail */}
      <div className="space-y-4">
        {TRANSNATIONAL_PATHWAYS.map((path) => (
          <div key={path.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">{path.qualification}</h2>

            <div className="text-xs space-y-2 text-slate-700">
              <div><strong>IBCC Conversion Rule:</strong> {path.hecEquivalencyFormula}</div>
              <div>
                <strong>Mandatory Requirements:</strong>
                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                  {path.keyRequirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Top Pakistani Universities Accepting This Pathway:</strong>
                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                  {path.pakistanUniOptions.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
