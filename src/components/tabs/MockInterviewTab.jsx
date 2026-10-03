import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic, Video, Sparkles, Play, Square, CheckCircle2, AlertCircle,
  RotateCcw, Send, Award, Loader2, ChevronRight, TrendingUp, RefreshCw
} from 'lucide-react';
import {
  getQuestionsForCategory, evaluateAnswer, buildSessionReport,
  INTERVIEW_CATEGORIES, DIFFICULTIES,
} from '../../services/interviewService.js';
import { saveInterviewSession } from '../../services/analyticsService.js';
import { FeatureGate } from '../common/FeatureGate.jsx';

// ── Score ring helpers ────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 60) return 'text-blue-600 dark:text-blue-400';
  if (s >= 40) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}
function scoreRingColor(s) {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
}
function gradeLabel(s) {
  if (s >= 85) return 'Excellent';
  if (s >= 70) return 'Good';
  if (s >= 55) return 'Satisfactory';
  return 'Needs Improvement';
}
function asList(value) {
  return Array.isArray(value) ? value : [];
}

// ── ScoreRing SVG component ───────────────────────────────────────────────────
function ScoreRing({ score, size = 96 }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={scoreRingColor(score)} strokeWidth={8}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function MockInterviewTab({ profile }) {
  // Setup state
  const [category, setCategory]       = useState(INTERVIEW_CATEGORIES[0]);
  const [difficulty, setDifficulty]   = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(3);

  // Session state
  const [phase, setPhase] = useState('setup'); // 'setup' | 'interview' | 'report'
  const [questions, setQuestions]     = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [userAnswer, setUserAnswer]   = useState('');
  const [answers, setAnswers]         = useState([]); // [{ question, answer, evaluation }]
  const [evaluating, setEvaluating]   = useState(false);
  const [evalError, setEvalError]     = useState(null);
  const [currentEval, setCurrentEval] = useState(null);
  const [recording, setRecording]     = useState(false);
  const [report, setReport]           = useState(null);

  const currentQuestion = questions[currentIdx] ?? null;

  // ── Start session ─────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    const qs = getQuestionsForCategory(category, numQuestions);
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers([]);
    setUserAnswer('');
    setCurrentEval(null);
    setEvalError(null);
    setPhase('interview');
  }, [category, numQuestions]);

  // ── Submit answer for AI evaluation ──────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim() || evaluating || !currentQuestion) return;
    setEvaluating(true);
    setEvalError(null);
    setCurrentEval(null);

    try {
      const evaluation = await evaluateAnswer({
        question: currentQuestion.q,
        answer: userAnswer,
        category,
        difficulty,
        profile,
      });
      setCurrentEval(evaluation);

      const updatedAnswers = [
        ...answers,
        { question: currentQuestion.q, hint: currentQuestion.hint, answer: userAnswer, evaluation },
      ];
      setAnswers(updatedAnswers);

      // If this was the last question, build report
      if (currentIdx >= questions.length - 1) {
        const r = buildSessionReport(updatedAnswers);
        setReport(r);
        // Persist to analytics history
        saveInterviewSession({
          ...r,
          category,
          difficulty,
        });
        setPhase('report');
      }
    } catch (err) {
      setEvalError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  }, [userAnswer, evaluating, currentQuestion, category, difficulty, profile, answers, currentIdx, questions.length]);

  // ── Next question ─────────────────────────────────────────────────────────
  const handleNextQuestion = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setUserAnswer('');
      setCurrentEval(null);
      setEvalError(null);
    }
  }, [currentIdx, questions.length]);

  // ── Restart ───────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    setPhase('setup');
    setAnswers([]);
    setCurrentEval(null);
    setReport(null);
    setEvalError(null);
    setRecording(false);
  }, []);

  // ── PHASE: SETUP ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-sm flex items-center gap-3 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Mock Interview Simulator</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time AI evaluation via Gemini — no random scores</p>
          </div>
        </div>

        {/* Setup card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Video className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure Your Interview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your answers will be evaluated by Gemini AI — expect honest, structured feedback.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Interview Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {INTERVIEW_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        difficulty === d
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Questions</label>
                <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none">
                  {[2,3,4,5].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Profile preview */}
          {profile && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Your profile will be used for evaluation context:</span>
              <span>{profile.name} · {profile.preferredStream} · {profile.gradeLevel}</span>
            </div>
          )}

          <button onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Play className="w-4 h-4 fill-current" />
            Start Interview Session
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: INTERVIEW ───────────────────────────────────────────────────────
  if (phase === 'interview') {
    const progressPct = Math.round((currentIdx / questions.length) * 100);
    const isLastQuestion = currentIdx >= questions.length - 1;
    const hasEval = !!currentEval;

    return (
      <div className="space-y-5">
        {/* Progress bar header */}
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Live Session
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">{category} · {difficulty}</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-xs">Q{currentIdx + 1} of {questions.length}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Question panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase w-fit">
              Question {currentIdx + 1}
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
              "{currentQuestion?.q}"
            </h3>
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> {currentQuestion?.hint}
            </div>
            <div className="flex-1" />
            {/* Mic toggle (cosmetic — text interview) */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setRecording(r => !r)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  recording ? 'bg-red-600 text-white border-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                {recording ? <><Square className="w-3.5 h-3.5" /> Stop</> : <><Mic className="w-3.5 h-3.5" /> Record</>}
              </button>
              <span className="text-[10px] text-slate-400">Or type your answer below</span>
            </div>
          </div>

          {/* Right: Answer + feedback panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col">
            {!hasEval ? (
              <>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Answer</label>
                <textarea rows={6} value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={evaluating}
                  placeholder="Type your complete answer here..."
                  className="flex-1 w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none disabled:opacity-60"
                />
                {evalError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {evalError}
                    <button onClick={() => setEvalError(null)} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <button onClick={handleSubmit}
                  disabled={evaluating || !userAnswer.trim()}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
                  {evaluating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating…</>
                    : <><Send className="w-4 h-4" /> Submit for AI Evaluation</>}
                </button>
              </>
            ) : (
              /* Evaluation result */
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1 flex flex-col">
                  {/* Score display */}
                  <div className="flex items-center gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <ScoreRing score={currentEval.score} size={96} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-black ${scoreColor(currentEval.score)}`}>{currentEval.score}</span>
                        <span className="text-[9px] text-slate-400 font-bold">/100</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-sm font-extrabold block ${scoreColor(currentEval.score)}`}>{gradeLabel(currentEval.score)}</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{currentEval.feedback}</p>
                    </div>
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    {[['Relevance', currentEval.relevance], ['Clarity', currentEval.clarity], ['Completeness', currentEval.completeness]].map(([l, v]) => (
                      <div key={l} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                        <span className="text-slate-400 block">{l}</span>
                        <span className={`font-extrabold text-sm ${scoreColor(v)}`}>{v}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">✓ Strengths</span>
                      {asList(currentEval.strengths).map((s, i) => <p key={i} className="text-emerald-900 dark:text-emerald-200">• {s}</p>)}
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                      <span className="font-extrabold text-amber-800 dark:text-amber-300 block">→ Improve</span>
                      {asList(currentEval.weaknesses).map((w, i) => <p key={i} className="text-amber-900 dark:text-amber-200">• {w}</p>)}
                    </div>
                  </div>

                  <div className="flex-1" />
                  <button onClick={handleNextQuestion}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20">
                    {isLastQuestion ? <><Award className="w-4 h-4" /> View Final Report</> : <><ChevronRight className="w-4 h-4" /> Next Question</>}
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: REPORT ──────────────────────────────────────────────────────────
  if (phase === 'report' && report) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Report header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 text-slate-900 dark:text-white rounded-3xl p-8 text-center space-y-4 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-xl">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <ScoreRing score={report.overallScore} size={112} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${scoreColor(report.overallScore)}`}>{report.overallScore}</span>
              <span className="text-[10px] text-slate-400 font-bold">/100</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{report.grade}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {report.totalQuestions} questions · {category} · {difficulty}
            </p>
          </div>
        </motion.div>

        {/* Per-question breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Question Breakdown</h3>
          {asList(report.perQuestion).map((pq, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className={`text-xl font-black w-12 text-center shrink-0 ${scoreColor(pq.score)}`}>{pq.score}</div>
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2">Q{pq.index}: {pq.question}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pq.feedback}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & improvement areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase">Key Strengths</h4>
            {asList(report.topStrengths).length > 0
              ? asList(report.topStrengths).map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> {s}
                  </div>
                ))
              : <p className="text-xs text-emerald-600">No specific strengths recorded.</p>
            }
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-3xl border border-amber-200 dark:border-amber-800 p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase">Areas to Improve</h4>
            {asList(report.areasToImprove).length > 0
              ? asList(report.areasToImprove).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> {a}
                  </div>
                ))
              : <p className="text-xs text-amber-600">No specific weaknesses recorded.</p>
            }
          </div>
        </div>

        {/* Recommended topics */}
        {asList(report.recommendedTopics).length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Recommended Study Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {asList(report.recommendedTopics).map((t, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleRestart}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
            <RotateCcw className="w-4 h-4" /> Start New Interview
          </button>
          <button onClick={() => {
            setPhase('interview');
            setCurrentIdx(0);
            setAnswers([]);
            setCurrentEval(null);
            setUserAnswer('');
            setEvalError(null);
          }}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
            <RefreshCw className="w-4 h-4" /> Retry Same Questions
          </button>
        </div>
      </div>
    );
  }

  return null;
}
