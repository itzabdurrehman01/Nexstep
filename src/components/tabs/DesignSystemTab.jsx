import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Palette, 
  Type, 
  Layers, 
  Box, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  Copy, 
  Check 
} from 'lucide-react';

export function DesignSystemTab() {
  const [copiedToken, setCopiedToken] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('colors');

  const copyToClipboard = (code, label) => {
    navigator.clipboard.writeText(code);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorTokens = [
    { name: 'Primary (Deep Blue)', hex: '#2563EB', class: 'bg-blue-600', textClass: 'text-blue-600', desc: 'Core brand action, primary buttons, active states' },
    { name: 'Secondary (Purple)', hex: '#7C3AED', class: 'bg-purple-600', textClass: 'text-purple-600', desc: 'AI highlights, secondary accents, badges' },
    { name: 'Accent (Emerald)', hex: '#10B981', class: 'bg-emerald-500', textClass: 'text-emerald-500', desc: 'Growth, career milestones, success states' },
    { name: 'Success (Green)', hex: '#22C55E', class: 'bg-green-500', textClass: 'text-green-500', desc: 'Completed tasks, verified badges, positive ROI' },
    { name: 'Warning (Amber)', hex: '#F59E0B', class: 'bg-amber-500', textClass: 'text-amber-500', desc: 'Approaching deadlines, pending items, alerts' },
    { name: 'Danger (Red)', hex: '#EF4444', class: 'bg-red-500', textClass: 'text-red-500', desc: 'Critical skill gaps, errors, drop risk warnings' },
    { name: 'Background (Light)', hex: '#F8FAFC', class: 'bg-slate-50 border border-slate-200', textClass: 'text-slate-800', desc: 'Default light app background canvas' },
    { name: 'Dark Slate', hex: '#0F172A', class: 'bg-slate-900', textClass: 'text-slate-900', desc: 'Dark theme background, high-contrast text' },
  ];

  const typographyTokens = [
    { level: 'Hero Display', size: '64px / 4rem', weight: 'Black (900)', sample: 'Empower Your Career Compass' },
    { level: 'Heading 1 (H1)', size: '36px / 2.25rem', weight: 'Extrabold (800)', sample: 'AI Career Recommendations' },
    { level: 'Heading 2 (H2)', size: '28px / 1.75rem', weight: 'Bold (700)', sample: 'Skill Gap & Roadmap Analysis' },
    { level: 'Heading 3 (H3)', size: '20px / 1.25rem', weight: 'Semibold (600)', sample: 'Recommended Academic Tracks' },
    { level: 'Body Large', size: '18px / 1.125rem', weight: 'Medium (500)', sample: 'Seamless multi-portal experience for students, mentors, and recruiters.' },
    { level: 'Body Medium', size: '14px / 0.875rem', weight: 'Regular (400)', sample: 'Analyze 50,000+ career trajectories powered by Gemini 3.6 Flash.' },
    { level: 'Caption', size: '12px / 0.75rem', weight: 'Semibold (600)', sample: 'HEC & BISE ACCREDITED • RECOGNIZED IN 120+ COUNTRIES' },
  ];

  const spacingGrid = [
    { token: 'space-1 (4px)', px: '4px', usage: 'Tight icon gap, pill padding' },
    { token: 'space-2 (8px)', px: '8px', usage: 'Card inner element gaps' },
    { token: 'space-4 (16px)', px: '16px', usage: 'Button horizontal padding, compact card padding' },
    { token: 'space-6 (24px)', px: '24px', usage: 'Default card padding, section gap' },
    { token: 'space-8 (32px)', px: '32px', usage: 'Large hero container padding' },
    { token: 'space-12 (48px)', px: '48px', usage: 'Major view section dividers' },
    { token: 'space-16 (64px)', px: '64px', usage: 'Landing page macro rhythm' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Design System Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white p-8 rounded-3xl shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Figma & Production Token Spec</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">NexStep Design System</h1>
          <p className="text-slate-300 text-xs leading-relaxed font-medium">
            Enterprise grade UI design specifications inspired by Apple, Stripe, Linear, OpenAI, Notion & Duolingo. WCAG AA compliant 8pt spacing grid and scalable component architecture.
          </p>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit text-xs font-bold">
        {[
          { id: 'colors', label: 'Color Tokens', icon: Palette },
          { id: 'typography', label: 'Typography Scale', icon: Type },
          { id: 'spacing', label: '8pt Spacing Grid', icon: Box },
          { id: 'components', label: 'Component Library', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'bg-white text-blue-600 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. COLOR TOKENS */}
      {activeSubTab === 'colors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {colorTokens.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 relative group"
            >
              <div className={`h-24 rounded-xl ${c.class} shadow-inner flex items-end p-3`}>
                <span className="text-xs font-mono font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                  {c.hex}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                  <button
                    onClick={() => copyToClipboard(c.hex, c.name)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy hex token"
                  >
                    {copiedToken === c.name ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 2. TYPOGRAPHY SCALE */}
      {activeSubTab === 'typography' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Inter / SF Pro Display Type Hierarchy</h2>
            <p className="text-xs text-slate-500 font-medium">Standardized modular type scale ratio 1.25 for crisp readability.</p>
          </div>
          <div className="space-y-6 divide-y divide-slate-100">
            {typographyTokens.map((t, i) => (
              <div key={i} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{t.level}</span>
                  <span className="text-[11px] text-slate-400 font-mono block">{t.size} • {t.weight}</span>
                </div>
                <div className="md:col-span-3">
                  <p className={`text-slate-900 truncate font-sans ${
                    i === 0 ? 'text-3xl font-black' :
                    i === 1 ? 'text-2xl font-extrabold' :
                    i === 2 ? 'text-xl font-bold' :
                    i === 3 ? 'text-lg font-semibold' :
                    i === 4 ? 'text-base font-medium' :
                    i === 5 ? 'text-sm font-normal' : 'text-xs uppercase font-bold text-slate-500 tracking-wider'
                  }`}>
                    {t.sample}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SPACING GRID */}
      {activeSubTab === 'spacing' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">8-Point Spacing Grid Tokens</h2>
            <p className="text-xs text-slate-500 font-medium">Strict layout alignment ensuring harmonious vertical & horizontal rhythm.</p>
          </div>
          <div className="space-y-4">
            {spacingGrid.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-32 shrink-0">
                  <span className="font-mono text-xs font-black text-blue-600 block">{s.token}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{s.px}</span>
                </div>
                <div className="h-6 bg-blue-500/20 rounded-md border border-blue-400/40" style={{ width: s.px }} />
                <span className="text-xs text-slate-600 font-semibold">{s.usage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. COMPONENT LIBRARY */}
      {activeSubTab === 'components' && (
        <div className="space-y-6">
          {/* Buttons & Badges */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Button & Badge Tokens</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer">
                Primary Action
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer">
                Secondary AI Action
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 cursor-pointer">
                Secondary Neutral
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs cursor-pointer">
                Accent Action
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                Primary Badge
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                AI Agent Active
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Verified Match 98%
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                Deadline 3 Days
              </span>
            </div>
          </div>

          {/* Cards & Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Input Field States</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Input</label>
                  <input
                    type="text"
                    defaultValue="Computer Science & AI Track"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-blue-500 text-slate-900 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standard Search Input</label>
                  <input
                    type="text"
                    placeholder="Search 100+ HEC Universities..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Card Elevation Preview</h3>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Interactive Glassmorphism Elevation</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Crisp hairline borders paired with soft drop shadows and backdrop blur filters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
