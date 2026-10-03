import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export function UpgradeModal({ onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const openSecureCheckout = () => {
    onClose();
    window.location.hash = '#/pricing';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade Plan
          </div>
          <h2 className="text-2xl font-black text-white">Choose Your NexStep Plan</h2>
          <p className="text-xs text-slate-400">Unlock advanced AI tools, 3-way comparisons, and certified mentor booking.</p>
        </div>

        {/* Plan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pro Plan */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'pro'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-emerald-400">Pro Student</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">PKR 1,999 <span className="text-xs font-normal text-slate-400">/month</span></div>
            <p className="text-xs text-slate-400 mb-4">Complete career acceleration for university students and graduates.</p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Everything in Premium</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Career Coach Session</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-on-1 Mentor Video Call</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Career Analytics & Priority Support</li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div
            onClick={() => setSelectedPlan('premium')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'premium'
                ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-purple-400">Premium Scholar</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">PKR 999 <span className="text-xs font-normal text-slate-400">/month</span></div>
            <p className="text-xs text-slate-400 mb-4">Full AI-powered career guidance for serious students.</p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Unlimited AI Mock Interviews</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Resume Builder & PDF Export</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Skill Gap Analysis</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Job Portal & Mentor Matching</li>
            </ul>
          </div>
        </div>

        <button
          onClick={openSecureCheckout}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
        >
          View Secure Checkout for {selectedPlan.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
