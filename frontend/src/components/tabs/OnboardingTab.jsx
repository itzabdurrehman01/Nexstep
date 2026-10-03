import React, { useState, useMemo, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Briefcase, GraduationCap, Target, MapPin, Calendar,
  Upload, Camera, X, Plus, CheckCircle2, ChevronDown, Trash2,
  Sparkles, Save, Loader2, Compass, BookOpen, Languages
} from 'lucide-react';

const STREAM_OPTIONS = [
  { value: 'PRE_MEDICAL', label: 'Pre-Medical' },
  { value: 'PRE_ENGINEERING', label: 'Pre-Engineering' },
  { value: 'ICS', label: 'ICS (Computer Science)' },
  { value: 'COMMERCE', label: 'Commerce' },
  { value: 'ARTS', label: 'Arts / Humanities' },
  { value: 'OTHER', label: 'Other' },
];

const EDUCATION_OPTIONS = [
  { value: 'MATRIC', label: 'Matric / O-Level' },
  { value: 'INTERMEDIATE', label: 'Intermediate / A-Level' },
  { value: 'UNDERGRAD', label: 'Undergraduate (BS/MBBS)' },
  { value: 'GRADUATE', label: 'Graduate (MS/MPhil)' },
  { value: 'PHD', label: 'PhD / Postgraduate' },
];

const PROVINCE_OPTIONS = [
  { value: 'PUNJAB', label: 'Punjab' },
  { value: 'SINDH', label: 'Sindh' },
  { value: 'KPK', label: 'Khyber Pakhtunkhwa' },
  { value: 'BALOCHISTAN', label: 'Balochistan' },
  { value: 'ISLAMABAD', label: 'Islamabad Capital' },
  { value: 'AJK', label: 'Azad Jammu & Kashmir' },
  { value: 'GB', label: 'Gilgit Baltistan' },
];

const CAREER_SUGGESTIONS = [
  'Software Engineer', 'Data Scientist', 'Doctor (MBBS)', 'Mechanical Engineer',
  'Civil Engineer', 'AI / ML Engineer', 'Chartered Accountant', 'Product Designer',
  'Cyber Security Analyst', 'Full Stack Developer', 'Business Analyst', 'Researcher',
];

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'React', 'TypeScript', 'Java', 'C++',
  'Machine Learning', 'Data Analysis', 'SQL', 'UI/UX Design', 'Problem Solving',
  'Communication', 'Leadership', 'Project Management', 'Research',
];

function SelectField({ id, label, value, onChange, options, placeholder = 'Select…', disabled, error, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const selected = options.find(o => o.value === value);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />}
        <button
          ref={btnRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
          className={`ns-select w-full text-left ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all disabled:opacity-60 bg-slate-50 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500/40 flex items-center justify-between ${
            error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
          } ${!selected ? 'text-slate-400 dark:text-slate-500' : ''}`}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-0 right-0 mt-2 w-full rounded-2xl ns-card shadow-2xl shadow-slate-900/10 p-1.5 max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-700"
              >
                {options.map(opt => {
                  const isSelected = value === opt.value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            </>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="ns-input-error text-[11px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}

function TagInput({ id, label, value = [], onChange, suggestions = [], placeholder, maxTags = 12 }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const filtered = suggestions
    .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
    .slice(0, 6);

  const addTag = (tag) => {
    const clean = tag.trim();
    if (!clean || value.includes(clean) || value.length >= maxTags) return;
    onChange([...value, clean]);
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter(t => t !== tag));

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
          <span className="ml-1 text-slate-400 font-medium">({value.length}/{maxTags})</span>
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`ns-input min-h-[48px] flex flex-wrap gap-1.5 items-center p-2 rounded-2xl border cursor-text bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all border-slate-200 dark:border-slate-700 focus-within:border-emerald-500`}
      >
        {value.map(tag => (
          <motion.span
            key={tag}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="rounded-full hover:bg-emerald-500/20 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}

        {value.length < maxTags && (
          <div className="relative flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag(input);
                } else if (e.key === 'Backspace' && !input && value.length > 0) {
                  removeTag(value[value.length - 1]);
                }
              }}
              onBlur={() => { if (input.trim()) addTag(input); }}
              placeholder={value.length === 0 ? placeholder : ''}
              className="w-full bg-transparent border-0 outline-hidden text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 py-1 px-1"
            />
            {input.trim() && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-xl ns-card p-1.5 shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto"
              >
                {filtered.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    <Plus className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                    <span>{s}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarUpload({ value, onChange }) {
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target && e.target.result;
      if (result) onChange(String(result));
    };
    reader.readAsDataURL(file);
  };

  const fallback = value || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-2">
      <div className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        Profile Photo
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 group">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 transition-transform group-hover:scale-[1.03]">
            <img
              src={fallback}
              alt="Profile avatar preview"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            aria-label="Upload profile photo"
            className="ns-badge absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remove profile photo"
              className="absolute -top-1 -left-1 w-7 h-7 rounded-xl bg-white dark:bg-slate-800 text-red-500 shadow-md ring-2 ring-white dark:ring-slate-800 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload a photo</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Square JPG or PNG under 5MB. Helps mentors and recruiters recognize you.
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileRef.current && fileRef.current.click()}
              className="ns-btn ns-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              Choose file
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            handleFile(files && files[0]);
          }}
        />
      </div>
    </div>
  );
}

export function OnboardingTab({ profile = {}, onSave, onSkip }) {
  const reduceMotion = useReducedMotion();

  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [province, setProvince] = useState(profile.province ?? '');
  const [stream, setStream] = useState(profile.stream ?? '');
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel ?? '');
  const [institution, setInstitution] = useState(profile.institution ?? '');
  const [graduationYear, setGraduationYear] = useState(String(profile.graduationYear ?? ''));
  const [targetCareer, setTargetCareer] = useState(profile.targetCareer ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [languages, setLanguages] = useState(profile.languages ?? ['English', 'Urdu']);
  const [skills, setSkills] = useState(profile.skills ?? []);
  const [interests, setInterests] = useState(profile.interests ?? []);
  const [bio, setBio] = useState(profile.bio ?? '');

  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [errors, setErrors] = useState({});

  const isDirty = useMemo(() => {
    const base = profile;
    return (
      (firstName || '') !== (base.firstName || '') ||
      (lastName || '') !== (base.lastName || '') ||
      (email || '') !== (base.email || '') ||
      (phone || '') !== (base.phone || '') ||
      (city || '') !== (base.city || '') ||
      province !== (base.province || '') ||
      stream !== (base.stream || '') ||
      educationLevel !== (base.educationLevel || '') ||
      (institution || '') !== (base.institution || '') ||
      graduationYear !== String(base.graduationYear || '') ||
      (targetCareer || '') !== (base.targetCareer || '') ||
      avatarUrl !== (base.avatarUrl || '') ||
      JSON.stringify(languages) !== JSON.stringify(base.languages || ['English', 'Urdu']) ||
      JSON.stringify(skills) !== JSON.stringify(base.skills || []) ||
      JSON.stringify(interests) !== JSON.stringify(base.interests || []) ||
      (bio || '') !== (base.bio || '')
    );
  }, [profile, firstName, lastName, email, phone, city, province, stream, educationLevel, institution, graduationYear, targetCareer, avatarUrl, languages, skills, interests, bio]);

  const handleSave = async () => {
    const required = {
      firstName: firstName.trim() ? '' : 'First name is required.',
      lastName: lastName.trim() ? '' : 'Last name is required.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : 'Valid email is required.',
    };
    setErrors(required);
    if (Object.values(required).some(Boolean)) return;

    setSaveState('saving');
    try {
      const payload = {
        firstName, lastName, email, phone, city, province, stream,
        educationLevel, institution,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
        targetCareer, avatarUrl, languages, skills, interests, bio,
      };
      if (onSave) await onSave(payload);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2200);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  };

  const sectionMotion = (delay) => reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <motion.section
        {...sectionMotion(0)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
          <motion.div
            whileHover={{ scale: 1.03, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/25 ring-4 ring-white/10"
          >
            <Sparkles className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
          </motion.div>
          <div className="space-y-2 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
              <Compass className="w-3 h-3" aria-hidden="true" />
              Setup Wizard · Step 1 of 2
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Tell us about yourself
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Fill in a few details to build your personalized career roadmap. We&apos;ll use this to match you with careers, skills, and opportunities across Pakistan.
            </p>
          </div>
          <SaveStateBadge state={saveState} dirty={isDirty} />
        </div>
      </motion.section>

      <motion.section {...sectionMotion(0.06)} className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20">
            <User className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Basic Information</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Your identity and contact details</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7">
          <div className="shrink-0">
            <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ob-firstname" className="block text-xs font-bold text-slate-700 dark:text-slate-300">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="ob-firstname"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className={`ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                    errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="Muhammad"
                />
              </div>
              {errors.firstName && <p className="ns-input-error text-[11px] text-red-500 dark:text-red-400 font-semibold">{errors.firstName}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ob-lastname" className="block text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="ob-lastname"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className={`ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                    errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="Ali"
                />
              </div>
              {errors.lastName && <p className="ns-input-error text-[11px] text-red-500 dark:text-red-400 font-semibold">{errors.lastName}</p>}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="ob-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="ob-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="student@example.com"
                />
              </div>
              {errors.email && <p className="ns-input-error text-[11px] text-red-500 dark:text-red-400 font-semibold">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ob-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone (Optional)</label>
              <input
                id="ob-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="ns-input w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ob-city" className="block text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="ob-city"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  placeholder="Lahore, Karachi, Islamabad…"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <SelectField
                id="ob-province"
                label="Province / Region"
                value={province}
                onChange={setProvince}
                options={PROVINCE_OPTIONS}
                placeholder="Select a province"
                icon={MapPin}
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(0.12)} className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-1 ring-blue-500/20">
            <GraduationCap className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Education Background</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Your current academic standing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            id="ob-education"
            label="Current / Highest Education"
            value={educationLevel}
            onChange={setEducationLevel}
            options={EDUCATION_OPTIONS}
            placeholder="Select level"
            icon={BookOpen}
          />
          <SelectField
            id="ob-stream"
            label="Academic Stream / Major"
            value={stream}
            onChange={setStream}
            options={STREAM_OPTIONS}
            placeholder="Select stream"
            icon={Compass}
          />
          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="ob-institution" className="block text-xs font-bold text-slate-700 dark:text-slate-300">School / College / University</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="ob-institution"
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                placeholder="e.g. NUST, LUMS, KIPS Academy, etc."
              />
            </div>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="ob-graduation" className="block text-xs font-bold text-slate-700 dark:text-slate-300">Expected Graduation Year</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="ob-graduation"
                type="number"
                min="2010"
                max="2040"
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value)}
                className="ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                placeholder="e.g. 2028"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(0.18)} className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center ring-1 ring-violet-500/20">
            <Target className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Career Goals &amp; Profile</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Shape your personalized NexStep roadmap</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ob-career" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Career <span className="text-slate-400 font-normal">(Where do you want to be in 5 years?)</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="ob-career"
                type="text"
                list="ob-career-options"
                value={targetCareer}
                onChange={e => setTargetCareer(e.target.value)}
                className="ns-input w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                placeholder="e.g. Software Engineer, Doctor, Architect…"
              />
              <datalist id="ob-career-options">
                {CAREER_SUGGESTIONS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ob-bio" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Short Bio <span className="text-slate-400 font-normal">({bio.length}/280)</span>
            </label>
            <textarea
              id="ob-bio"
              rows={3}
              maxLength={280}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="ns-input w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 resize-none"
              placeholder="Tell mentors & recruiters a little about who you are, your aspirations, and what you're working on right now…"
            />
          </div>

          <TagInput
            id="ob-languages"
            label="Languages"
            value={languages}
            onChange={setLanguages}
            suggestions={['English', 'Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki', 'Arabic', 'Spanish', 'French', 'Mandarin', 'German']}
            placeholder="Type and press Enter to add languages"
            maxTags={8}
          />

          <TagInput
            id="ob-skills"
            label="Current Skills"
            value={skills}
            onChange={setSkills}
            suggestions={SKILL_SUGGESTIONS}
            placeholder="Add skills like Python, React, Data Analysis…"
            maxTags={15}
          />

          <TagInput
            id="ob-interests"
            label="Interests &amp; Hobbies"
            value={interests}
            onChange={setInterests}
            suggestions={['Reading', 'Coding', 'Gaming', 'Photography', 'Volunteering', 'Sports', 'Music', 'Art', 'Robotics', 'Debates', 'Community Work', 'Tutoring']}
            placeholder="Add interests and areas of curiosity"
            maxTags={12}
          />
        </div>
      </motion.section>

      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="sticky bottom-4 z-30"
      >
        <div className="ns-card p-4 sm:p-5 shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Profile Progress</span>
              {isDirty && <span className="ns-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-200 dark:border-amber-800/40">Unsaved changes</span>}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Save your info and we&apos;ll generate a personalized career roadmap for you.
            </div>
          </div>
          <div className="flex gap-2.5 sm:flex-shrink-0">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="ns-btn ns-btn-ghost flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs font-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Skip for now
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="ns-btn ns-btn-primary flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-xs font-black cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 flex items-center justify-center gap-2"
            >
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Saving…</span>
                </>
              ) : saveState === 'saved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Save &amp; Continue</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SaveStateBadge({ state, dirty }) {
  if (state === 'saved') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
      >
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        <span className="text-[11px] font-black">All changes saved</span>
      </motion.div>
    );
  }
  if (state === 'saving') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span className="text-[11px] font-black">Saving…</span>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        <span className="text-[11px] font-black">Couldn&apos;t save</span>
      </div>
    );
  }
  if (dirty) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        <span className="text-[11px] font-black">Unsaved changes</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400">
      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
      <span className="text-[11px] font-black">Up to date</span>
    </div>
  );
}

export default OnboardingTab;
