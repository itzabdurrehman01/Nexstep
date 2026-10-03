/**
 * RolePortalSelector.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * First screen shown to every new user after registration.
 *
 * STUDENT   → asks education level (Grade 8 / Matric / FSc / University)
 *             → saves to profile → redirects to the matching portal section
 *
 * MENTOR    → asks subject area / specialisation
 *             → saves to profile → redirects to /portal/mentor
 *
 * RECRUITER → asks hiring industry
 *             → saves to profile → redirects to /portal/recruiter
 *
 * Fully bilingual (en / ur) with RTL support.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap, Users, Building2, ArrowRight, CheckCircle2,
  BookOpen, School, Sparkles, Briefcase, ChevronRight, Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Bilingual copy ────────────────────────────────────────────────────────────
const COPY = {
  en: {
    welcomeStudent:   'Welcome to NexStep!',
    welcomeMentor:    'Welcome, Mentor!',
    welcomeRecruiter: 'Welcome, Recruiter!',
    subtitleStudent:  "Tell us which stage of your education journey you're at so we can personalise your experience.",
    subtitleMentor:   'What subject or area do you primarily teach or guide students in?',
    subtitleRecruiter:'What industry do you recruit talent for?',
    continueBtn:      'Continue',
    saving:           'Setting up your portal…',
    selectPrompt:     'Select one to continue',
    studentLevels: [
      { value: 'Grade 8 (Middle School)',          label: 'Grade 8',          badge: '8th',  desc: 'Middle school — choosing the right stream',        icon: BookOpen },
      { value: 'Matric / O-Levels (9-10)',          label: 'Matric / 9–10',   badge: '9-10', desc: 'Secondary school — board exam prep',               icon: School },
      { value: 'FSc / Inter (11-12)',               label: 'FSc / College',   badge: '11-12',desc: 'Intermediate — MDCAT, ECAT & admissions',           icon: GraduationCap },
      { value: 'Undergraduate (BS / University)',   label: 'University',      badge: 'BS',   desc: 'Degree level — careers, skills & research',         icon: Sparkles },
    ],
    mentorAreas: [
      'STEM (Science, Math, Engineering)',
      'Medical & Health Sciences',
      'Computer Science & AI',
      'Business & Finance',
      'Humanities & Social Sciences',
      'Arts & Design',
      'Law & Public Policy',
      'Other',
    ],
    recruiterIndustries: [
      'Technology & Software',
      'Healthcare & Pharma',
      'Banking & Finance',
      'Engineering & Manufacturing',
      'Education & Training',
      'Media & Communications',
      'Government & NGO',
      'Other',
    ],
  },
  ur: {
    welcomeStudent:   'نیکسٹ اسٹیپ میں خوش آمدید!',
    welcomeMentor:    'خوش آمدید، استاد!',
    welcomeRecruiter: 'خوش آمدید، ریکروٹر!',
    subtitleStudent:  'بتائیں آپ تعلیم کے کس مرحلے پر ہیں تاکہ ہم آپ کا تجربہ ذاتی بنا سکیں۔',
    subtitleMentor:   'آپ بنیادی طور پر کون سا مضمون یا شعبہ پڑھاتے یا رہنمائی کرتے ہیں؟',
    subtitleRecruiter:'آپ کس صنعت میں بھرتی کرتے ہیں؟',
    continueBtn:      'آگے بڑھیں',
    saving:           'آپ کا پورٹل تیار ہو رہا ہے…',
    selectPrompt:     'جاری رکھنے کے لیے ایک منتخب کریں',
    studentLevels: [
      { value: 'Grade 8 (Middle School)',          label: 'کلاس 8',          badge: '8',    desc: 'مڈل اسکول — صحیح گروپ کا انتخاب',    icon: BookOpen },
      { value: 'Matric / O-Levels (9-10)',          label: 'میٹرک / 9–10',   badge: '9-10', desc: 'ثانوی تعلیم — بورڈ امتحان کی تیاری',   icon: School },
      { value: 'FSc / Inter (11-12)',               label: 'انٹرمیڈیٹ',      badge: '11-12',desc: 'MDCAT، ECAT اور داخلے',               icon: GraduationCap },
      { value: 'Undergraduate (BS / University)',   label: 'یونیورسٹی',      badge: 'BS',   desc: 'ڈگری — کیریئر، مہارتیں اور تحقیق',    icon: Sparkles },
    ],
    mentorAreas: [
      'سائنس، ریاضی، انجینئرنگ',
      'طب اور صحت کی علوم',
      'کمپیوٹر سائنس اور AI',
      'کاروبار اور فنانس',
      'ہیومینٹیز اور سوشل سائنسز',
      'آرٹس اور ڈیزائن',
      'قانون اور پالیسی',
      'دیگر',
    ],
    recruiterIndustries: [
      'ٹیکنالوجی اور سافٹ ویئر',
      'صحت اور فارما',
      'بینکنگ اور فنانس',
      'انجینئرنگ اور مینوفیکچرنگ',
      'تعلیم اور تربیت',
      'میڈیا اور مواصلات',
      'حکومت اور این جی او',
      'دیگر',
    ],
  },
};

// ── Portal destination map per student level ─────────────────────────────────
const STUDENT_LEVEL_DEST = {
  'Grade 8 (Middle School)':        'grade8Matric',
  'Matric / O-Levels (9-10)':       'grade8Matric',
  'FSc / Inter (11-12)':            'fscMapper',
  'Undergraduate (BS / University)':'careerAi',
};

// ── Component ─────────────────────────────────────────────────────────────────
export function RolePortalSelector({ lang = 'en', onComplete, onNavigate }) {
  const { user } = useAuth();
  const role = String(user?.role ?? 'STUDENT').trim().toUpperCase();
  const t    = COPY[lang] || COPY.en;

  const [selected, setSelected] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  const title    = role === 'MENTOR'    ? t.welcomeMentor
                 : role === 'RECRUITER' ? t.welcomeRecruiter
                 : t.welcomeStudent;
  const subtitle = role === 'MENTOR'    ? t.subtitleMentor
                 : role === 'RECRUITER' ? t.subtitleRecruiter
                 : t.subtitleStudent;
  const options  = role === 'MENTOR'    ? t.mentorAreas
                 : role === 'RECRUITER' ? t.recruiterIndustries
                 : null; // student uses level tiles

  const studentLevels = role === 'STUDENT' ? t.studentLevels : null;

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Save to profile
      const body = role === 'STUDENT'
        ? { gradeLevel: selected }
        : role === 'MENTOR'
        ? { bio: `Teaching area: ${selected}`, targetCareer: selected }
        : { targetCareer: selected };   // RECRUITER: store hiring industry as targetCareer

      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
    } catch { /* non-fatal */ }

    setDone(true);
    setSaving(false);

    // Small celebration delay, then navigate
    setTimeout(() => {
      if (onComplete) onComplete(selected);
      if (onNavigate) {
        if (role === 'MENTOR')    { onNavigate('mentorPortal');   return; }
        if (role === 'RECRUITER') { onNavigate('recruiterPortal'); return; }
        // Student → destination based on level, default to onboarding wizard
        const dest = STUDENT_LEVEL_DEST[selected] || 'onboarding';
        onNavigate(dest);
      }
    }, 800);
  };

  const isUrdu = lang === 'ur';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isUrdu ? 'font-urdu' : ''}`}>
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
            {role === 'MENTOR'    ? <Users className="w-8 h-8" />
           : role === 'RECRUITER' ? <Building2 className="w-8 h-8" />
           : <GraduationCap className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* ── STUDENT: education level tiles ── */}
        {role === 'STUDENT' && studentLevels && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {studentLevels.map((lvl, idx) => {
              const Icon = lvl.icon;
              const isSelected = selected === lvl.value;
              return (
                <motion.button
                  key={lvl.value}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * idx }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(lvl.value)}
                  className={`relative p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer border-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />
                  )}
                  <div className="flex items-start gap-4">
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {lvl.badge}
                    </span>
                    <div className="min-w-0">
                      <div className={`text-sm font-extrabold ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                        {lvl.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {lvl.desc}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* ── MENTOR / RECRUITER: option list ── */}
        {options && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {options.map((opt, idx) => {
              const isSelected = selected === opt;
              return (
                <motion.button
                  key={opt}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(opt)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Continue button */}
        <AnimatePresence>
          {(selected || done) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: done ? 1 : 1.03 }}
                whileTap={{ scale: done ? 1 : 0.97 }}
                onClick={handleContinue}
                disabled={saving || done}
                className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg transition-all ${
                  done
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 cursor-pointer'
                } disabled:opacity-70`}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.saving}</>
                ) : done ? (
                  <><CheckCircle2 className="w-4 h-4" /> {isUrdu ? 'تیار!' : 'All set!'}</>
                ) : (
                  <>{t.continueBtn} <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress hint */}
        {!selected && !done && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            {t.selectPrompt}
          </p>
        )}
      </div>
    </div>
  );
}

export default RolePortalSelector;
