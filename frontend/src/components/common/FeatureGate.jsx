import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal.jsx';

export function FeatureGate({
  children,
  requiredPlan = 'pro',
  featureName = 'Pro Feature',
  featureDesc = 'Unlock full access to this premium career guidance tool.',
  userPlan = 'free',
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activePlan, setActivePlan] = useState(userPlan);

  useEffect(() => {
    // Check current user subscription plan from backend
    fetch('/api/payments/subscription', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.data?.plan_slug || d?.data?.planSlug) {
          setActivePlan(d.data.plan_slug || d.data.planSlug);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setActivePlan(userPlan);
  }, [userPlan]);

  const planRanks = { free: 0, premium: 1, pro: 2 };
  const isUnlocked = (planRanks[activePlan] || 0) >= (planRanks[requiredPlan] || Number.MAX_SAFE_INTEGER);

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/40 shadow-2xl">
      {/* Background Tool Preview (blurred) */}
      <div className="filter blur-md opacity-30 pointer-events-none select-none">
        {children}
      </div>

      {/* Glassmorphic Locked Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/75 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/10 animate-bounce">
          <Lock className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono font-bold tracking-wider mb-3 uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Pro Feature Locked
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {featureName}
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          {featureDesc}
        </p>

        {/* Feature Benefits Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md w-full mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Unlimited AI Evaluations
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Priority University Cutoffs
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            PDF Career Reports
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            1-on-1 Mentor Connect
          </div>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          View secure upgrade options
          <ArrowRight className="w-4 h-4" />
        </button>

        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
          />
        )}
      </div>
    </div>
  );
}
