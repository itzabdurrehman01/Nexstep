import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Save, User, MapPin, GraduationCap, Award, Plus,
  Trash2, CheckCircle2, AlertCircle, Loader2, Target, BookOpen
} from 'lucide-react';
import { translations } from '../data/translations.js';
import { tr } from '../utils/translator.js';

// ── Reusable field wrapper ────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors';
const selectClass = inputClass;

// ── Skill level badge ─────────────────────────────────────────────────────────
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const SKILL_CATEGORIES = ['Technical', 'Academic', 'Soft Skill', 'Language', 'Other'];

function SkillRow({ skill, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={skill.name}
        onChange={e => onChange({ ...skill, name: e.target.value })}
        placeholder="e.g. Python, SQL…"
        className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <select
        value={skill.level}
        onChange={e => onChange({ ...skill, level: e.target.value })}
        className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
      >
        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <button type="button" onClick={onRemove}
        className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-all"
        title="Remove skill">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Profile completion bar ────────────────────────────────────────────────────
function completionScore(fd) {
  const checks = [
    fd?.name?.trim(),
    fd?.city,
    fd?.preferredStream,
    fd?.marks?.matricPct,
    fd?.marks?.fscPct,
    fd?.topRiasecCluster,
    fd?.targetCareer,
    fd?.goals,
    Array.isArray(fd?.skills) && fd.skills.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProfileModal({ isOpen, onClose, profile, onSaveProfile, lang }) {
  if (!isOpen) return null;

  const t = translations[lang];
  const [formData, setFormData] = useState({ ...profile });
  const [saving, setSaving]     = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type, msg }

  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));
  const setNested = (parent, field, value) =>
    setFormData(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  // Skill helpers
  const skills = Array.isArray(formData.skills) ? formData.skills : [];
  const addSkill = () =>
    setFormData(p => ({
      ...p, skills: [...(p.skills || []), { name: '', level: 'Beginner', category: 'Technical' }],
    }));
  const updateSkill = (idx, updated) =>
    setFormData(p => ({ ...p, skills: p.skills.map((s, i) => i === idx ? updated : s) }));
  const removeSkill = (idx) =>
    setFormData(p => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      await onSaveProfile(formData);
      setSaveStatus({ type: 'success', msg: 'Profile saved successfully.' });
      setTimeout(() => { setSaveStatus(null); onClose(); }, 1200);
    } catch {
      setSaveStatus({ type: 'error', msg: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const pct = completionScore(formData);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t.profile.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.profile.setupHeadline}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile completion */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span>Profile Completion</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Status banner */}
          {saveStatus && (
            <div className={`mx-6 mt-4 flex items-center gap-2 p-3 rounded-2xl border text-xs font-medium ${
              saveStatus.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}>
              {saveStatus.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
              {saveStatus.msg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Personal info */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label={t.profile.name}>
                    <input type="text" value={formData.name || ''} onChange={e => set('name', e.target.value)}
                      className={inputClass} placeholder="e.g. Muhammad Ali" required />
                  </Field>
                </div>
                <Field label={t.profile.city}>
                  <input type="text" value={formData.city || ''} onChange={e => set('city', e.target.value)}
                    className={inputClass} placeholder="e.g. Islamabad" />
                </Field>
                <Field label={t.profile.province}>
                  <select value={formData.province || 'Punjab'} onChange={e => set('province', e.target.value)} className={selectClass}>
                    {['Punjab','Sindh','KPK','Balochistan','Islamabad','AJK/GB'].map(p => (
                      <option key={p} value={p}>{tr(p, lang)}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* Academic info */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" /> Academic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t.profile.grade}>
                  <select value={formData.gradeLevel || 'FSc / Inter (11-12)'} onChange={e => set('gradeLevel', e.target.value)} className={selectClass}>
                    {['Grade 8','Matric (9-10)','FSc / Inter (11-12)','Transnational (O/A-Levels)','University'].map(g => (
                      <option key={g} value={g}>{tr(g, lang)}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t.profile.fscStream}>
                  <select value={formData.preferredStream || 'ICS (Comp Sci)'} onChange={e => set('preferredStream', e.target.value)} className={selectClass}>
                    {['Pre-Medical','Pre-Engineering','ICS (Comp Sci)','ICOM (Commerce)','Arts/FA','DAE (Diploma)','TEVTA Trade','A-Levels'].map(s => (
                      <option key={s} value={s}>{tr(s, lang)}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t.profile.income}>
                  <input type="number" value={formData.familyMonthlyIncomePkr || 0}
                    onChange={e => set('familyMonthlyIncomePkr', parseInt(e.target.value) || 0)}
                    className={inputClass} placeholder="Monthly income PKR" min={0} />
                </Field>
                <Field label={t.profile.annualBudget}>
                  <input type="number" value={formData.budgetAnnualPkr || 0}
                    onChange={e => set('budgetAnnualPkr', parseInt(e.target.value) || 0)}
                    className={inputClass} placeholder="Annual fee budget PKR" min={0} />
                </Field>
              </div>
            </div>

            {/* Academic marks */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" /> Academic Marks
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Matric %',     'matricPct'],
                  ['FSc / Inter %','fscPct'],
                  ['Entry Test',   'entryTestScore'],
                ].map(([label, field]) => (
                  <div key={field} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">{label}</label>
                    <input type="number" min={0} max={100}
                      value={formData.marks?.[field] || ''}
                      onChange={e => setNested('marks', field, parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Career goals */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Career Goals
              </h3>
              <div className="space-y-3">
                <Field label="Target Career">
                  <input type="text" value={formData.targetCareer || ''} onChange={e => set('targetCareer', e.target.value)}
                    className={inputClass} placeholder="e.g. Software & AI Engineering" />
                </Field>
                <Field label="Career Goals">
                  <textarea rows={2} value={formData.goals || ''} onChange={e => set('goals', e.target.value)}
                    className={inputClass + ' resize-none'} placeholder="e.g. Gain admission to BS CS at NUST…" />
                </Field>
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> Skills ({skills.length})
                </h3>
                <button type="button" onClick={addSkill}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-950 text-[10px] font-extrabold cursor-pointer transition-all">
                  <Plus className="w-3 h-3" /> Add Skill
                </button>
              </div>
              <div className="space-y-2">
                {skills.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-3">
                    No skills added yet — click "Add Skill" to get started.
                  </p>
                )}
                {skills.map((sk, idx) => (
                  <SkillRow key={idx} skill={sk}
                    onChange={updated => updateSkill(idx, updated)}
                    onRemove={() => removeSkill(idx)} />
                ))}
              </div>
            </div>
          </form>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> {t.profile.save}</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
