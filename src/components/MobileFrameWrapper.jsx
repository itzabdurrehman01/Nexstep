import React from 'react';
import { Smartphone, X } from 'lucide-react';

export function MobileFrameWrapper({ children, onClose }) {
  return (
    <div className="py-6 flex flex-col items-center justify-center min-h-screen bg-slate-900/90 backdrop-blur-md p-4">
      {/* Phone Header Control */}
      <div className="w-full max-w-[390px] flex items-center justify-between text-white text-xs mb-3 font-semibold">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>React Native Expo EAS Mobile Preview</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
        >
          Exit Mobile View
        </button>
      </div>

      {/* Mobile Frame Container */}
      <div className="w-full max-w-[390px] h-[812px] bg-slate-950 rounded-[50px] p-4 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div>
        </div>

        {/* Inner Phone Screen Content */}
        <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-y-auto no-scrollbar pt-6 pb-4">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-50"></div>
      </div>
    </div>
  );
}
