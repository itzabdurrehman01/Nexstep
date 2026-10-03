import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Award,
  Wrench,
  Calculator,
  Palette,
  Users,
  Briefcase,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import { RIASEC_QUESTIONS } from '../../data/riasecQuestions.js';
import { CAREERS_DATA } from '../../data/careersData.js';
import { translations } from '../../data/translations.js';
import confetti from 'canvas-confetti';

export function QuizTab({ profile = {}, onUpdateProfile, onNavigate, lang }) {
  const t = translations[lang] ?? translations.en;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const question = RIASEC_QUESTIONS[currentIdx];
  const totalQuestions = RIASEC_QUESTIONS.length;

  const categoryNames = {
    R: { name: 'Realistic (Hands-on / Technical)', nameUr: 'عملی اور ٹیکنیکل' },
    I: { name: 'Investigative (Scientific / Analytical)', nameUr: 'تحقیقی اور سائنسی' },
    A: { name: 'Artistic (Creative / Design)', nameUr: 'تخلیقی اور آرٹ' },
    S: { name: 'Social (Helping / Teaching)', nameUr: 'سماجی اور تدریسی' },
    E: { name: 'Enterprising (Leadership / Business)', nameUr: 'لیڈرشپ اور بزنس' },
    C: { name: 'Conventional (Structured / Financial)', nameUr: 'منظم اور حساب کتاب' },
  };

  const handleSelectOption = (value) => {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      calculateResults(updated);
    }
  };

  const calculateResults = (finalAnswers) => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    RIASEC_QUESTIONS.forEach((q) => {
      const val = finalAnswers[q.id] || 0;
      scores[q.category] += val;
    });

    let topCat = 'I';
    let maxScore = -1;
    Object.entries(scores).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score;
        topCat = cat;
      }
    });

    // Save to student profile (local state)
    onUpdateProfile({
      topRiasecCluster: `${topCat} - ${categoryNames[topCat].name}`,
      riasecScores: scores
    });

    // Persist to backend DB
    const saveToDb = async () => {
      try {
        await fetch('/api/quiz-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            quizType: 'RIASEC',
            answers: finalAnswers,
            scores,
            topCluster: `${topCat} - ${categoryNames[topCat].name}`,
          }),
        });
        // Also update profile with RIASEC result
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            topRiasecCluster: `${topCat} - ${categoryNames[topCat].name}`,
            riasecScores: scores,
          }),
        });
      } catch { /* ignore — profile updated locally anyway */ }
    };
    saveToDb();

    // Celebratory 3D Confetti Burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b']
    });

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
  };

  // Get matched careers based on top RIASEC category
  const getMatchedCareers = () => {
    if (!profile?.riasecScores) return CAREERS_DATA.slice(0, 4);
    
    // Sort RIASEC categories
    const sortedCats = Object.entries(profile.riasecScores)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const topTwo = sortedCats.slice(0, 2);

    return CAREERS_DATA.filter((car) => 
      (car.riasecMatch ?? []).some(m => topTwo.includes(m))
    );
  };

  if (isSubmitted || profile?.riasecScores) {
    const scores = profile.riasecScores || { R: 18, I: 22, A: 14, S: 16, E: 20, C: 15 };
    const maxScore = Math.max(...Object.values(scores), 1);
    const matched = getMatchedCareers();

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assessment Complete</span>
          </div>

          <h1 className="text-2xl font-extrabold">{t.quiz.resultsTitle}</h1>
          <p className="text-slate-300 text-sm">
            {lang === 'ur'
              ? `آپ کا بنیادی Holland RIASEC کوڈ (${profile.topRiasecCluster}) ہے۔ نیچے دیے گئے گراف اور شعبے آپ کی شخصیت سے مطابقت رکھتے ہیں۔`
              : `Your primary Holland model code is calculated as (${profile.topRiasecCluster}). Here is your category breakdown and aligned career pathways.`}
          </p>

          <div className="pt-2 flex gap-3 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.quiz.retake}</span>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('careerAi')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View My Career Matches →</span>
              </button>
            )}
          </div>
        </div>

        {/* Score Breakdown Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">RIASEC Category Score Breakdown</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scores).map(([cat, score]) => {
              const catInfo = categoryNames[cat];
              const pct = Math.round((score / 25) * 100);

              return (
                <div key={cat} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{cat} - {lang === 'ur' ? catInfo.nameUr : catInfo.name}</span>
                    <span className="text-emerald-700 font-extrabold">{pct}%</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matched Careers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.quiz.matchedCareers}</h2>
              <p className="text-xs text-slate-500">Careers recommended specifically for your Holland code</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              AI Match
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matched.map((car) => (
              <div key={car.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    {lang === 'ur' ? car.titleUr : car.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {car.demandLevel} Demand
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{car.description}</p>

                <div className="text-xs space-y-1 text-slate-700 font-medium">
                  <div><strong>Required Stream:</strong> {car.streamRequired}</div>
                  <div><strong>Avg Salary PKR:</strong> {(car.avgSalaryPkrMonth ?? car.avgSalaryPkr)?.toLocaleString()}</div>
                </div>

                <button
                  onClick={() => onNavigate('fscMapper')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore Stream Cutoffs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Question Card
  const progressPct = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.quiz.questionProgress} {currentIdx + 1} / {totalQuestions}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t.quiz.title}</h1>
        <p className="text-xs text-slate-500">{t.quiz.subtitle}</p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
        <div className="text-center space-y-3 py-4">
          <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            "{question.textEn}"
          </p>
          <p className="text-sm font-urdu text-emerald-800 leading-relaxed">
            "{question.textUr}"
          </p>
        </div>

        {/* Rating Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSelectOption(1)}
            className="py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 text-slate-700 font-bold text-xs transition-all text-center"
          >
            {t.quiz.dislike}
          </button>

          <button
            onClick={() => handleSelectOption(3)}
            className="py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 font-bold text-xs transition-all text-center"
          >
            {t.quiz.neutral}
          </button>

          <button
            onClick={() => handleSelectOption(5)}
            className="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all text-center shadow-xs"
          >
            {t.quiz.like}
          </button>
        </div>

        {/* Prev Button */}
        {currentIdx > 0 && (
          <div className="flex justify-start pt-2">
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
