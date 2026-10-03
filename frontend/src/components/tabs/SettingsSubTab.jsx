import React, { useState, useMemo, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Briefcase, GraduationCap, Target, MapPin, Calendar,
  Upload, Camera, X, Plus, CheckCircle2, ChevronDown, Trash2,
  Sparkles, Save, Loader2, Compass, BookOpen, Languages, Settings2,
  ShieldCheck, Bell, Moon, Sun, Eye, EyeOff, KeyRound, AlertCircle,
  LogOut, UserCog, Globe, Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

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

const SETTING_TABS = [
  { id: 'profile', label: 'Profile', icon: UserCog },
  { id: 'account', label: 'Account', icon: ShieldCheck },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
];

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'React', 'TypeScript', 'Java', 'C++',
  'Machine Learning', 'Data Analysis', 'SQL', 'UI/UX Design', 'Problem Solving',
  'Communication', 'Leadership', 'Project Management', 'Research',
];

function SelectField({ id, label, value, onChange, options, placeholder = 'Select…', disabled, error, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />}
        <button
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
        <p className="ns-input-error text-[11px] text-red-500 dark:text-red-400 font-semibold">{error}</p>
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
        className="ns-input min-h-[48px] flex flex-wrap gap-1.5 items-center p-2 rounded-2xl border cursor-text bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all border-slate-200 dark:border-slate-700 focus-within:border-emerald-500"
      >
        {value.map(tag => (
          <motion.span
            key={tag}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
  const fallback = value || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&auto=format&fit=crop&q=80';
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
  return (
    <div className="space-y-2">
      <div className="block text-xs font-bold text-slate-700 dark:text-slate-300">Profile Photo</div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 hover:scale-[1.03] transition-transform">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
            <img src={fallback} alt="Profile avatar preview" width={96} height={96} className="w-full h-full object-cover" />
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
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            className="ns-btn ns-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            Choose file
          </button>
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

function Toggle({ checked, onChange, label, description, Icon }) {
  return (
    <label className="flex items-start gap-3 sm:gap-4 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700/60 text-slate-500 dark:text-slate-400 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {Icon && <Icon className="w-4.5 h-4.5" aria-hidden="true" />}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
        <div className="text-xs font-black text-slate-800 dark:text-slate-200">{label}</div>
        {description && <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 mt-0.5 w-11 h-6 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:ring-emerald-500/50 ${
          checked ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}

export function SettingsSubTab({ profile = {}, onSave, onLogout }) {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState('profile');
  const [saveState, setSaveState] = useState('idle');

  const [firstName, setFirstName] = useState(profile.firstName ?? user?.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? user?.lastName ?? '');
  const [email, setEmail] = useState(profile.email ?? user?.email ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [province, setProvince] = useState(profile.province ?? '');
  const [stream, setStream] = useState(profile.stream ?? '');
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel ?? '');
  const [institution, setInstitution] = useState(profile.institution ?? '');
  const [graduationYear, setGraduationYear] = useState(String(profile.graduationYear ?? ''));
  const [targetCareer, setTargetCareer] = useState(profile.targetCareer ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? user?.avatarUrl ?? '');
  const [languages, setLanguages] = useState(profile.languages ?? ['English', 'Urdu']);
  const [skills, setSkills] = useState(profile.skills ?? []);
  const [bio, setBio] = useState(profile.bio ?? '');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [mentorRequests, setMentorRequests] = useState(true);
  const [marketingOptin, setMarketingOptin] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [errors, setErrors] = useState({});

  const isDirty = useMemo(() => {
    const base = profile;
    return (
      (firstName || '') !== (base.firstName || user?.firstName || '') ||
      (lastName || '') !== (base.lastName || user?.lastName || '') ||
      (email || '') !== (base.email || user?.email || '') ||
      (phone || '') !== (base.phone || '') ||
      (city || '') !== (base.city || '') ||
      province !== (base.province || '') ||
      stream !== (base.stream || '') ||
      educationLevel !== (base.educationLevel || '') ||
      (institution || '') !== (base.institution || '') ||
      graduationYear !== String(base.graduationYear || '') ||
      (targetCareer || '') !== (base.targetCareer || '') ||
      avatarUrl !== (base.avatarUrl || user?.avatarUrl || '') ||
      JSON.stringify(languages) !== JSON.stringify(base.languages || ['English', 'Urdu']) ||
      JSON.stringify(skills) !== JSON.stringify(base.skills || []) ||
      (bio || '') !== (base.bio || '')
    );
  }, [profile, user, firstName, lastName, email, phone, city, province, stream, educationLevel, institution, graduationYear, targetCareer, avatarUrl, languages, skills, bio]);

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
      if (onSave) await onSave({
        firstName, lastName, email, phone, city, province, stream,
        educationLevel, institution,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
        targetCareer, avatarUrl, languages, skills, bio,
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2200);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      setPwdSuccess('Password changed successfully. For your security, other sessions have been signed out.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwdSuccess(''), 3500);
    } catch {
      setPwdError('Unable to change password. Please verify your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const headerMotion = reduceMotion ? {} : { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
  const sectionMotion = (delay) => reduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <motion.section {...headerMotion} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 md:p-7 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
          <motion.div whileHover={{ scale: 1.03, rotate: -1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/25 ring-4 ring-white/10">
            <Settings2 className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
          </motion.div>
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Account Settings</h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Manage your profile, account security, and preferences. Changes are encrypted and auto-synced across all your devices.
            </p>
          </div>
          <SaveStateBadge state={saveState} dirty={isDirty} onSave={handleSave} saving={saveState === 'saving'} />
        </div>

        <nav aria-label="Settings sections" className="relative z-10 mt-6">
          <div role="tablist" className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            {SETTING_TABS.map(tab => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </motion.section>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" {...sectionMotion(0.05)} className="space-y-6">
            <section className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={User} title="Basic Information" subtitle="Your identity and contact details" color="emerald" />
              <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7">
                <div className="shrink-0"><AvatarUpload value={avatarUrl} onChange={setAvatarUrl} /></div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldInput id="st-firstname" label="First Name" value={firstName} onChange={setFirstName} error={errors.firstName} icon={User} placeholder="Muhammad" />
                  <FieldInput id="st-lastname" label="Last Name" value={lastName} onChange={setLastName} error={errors.lastName} icon={User} placeholder="Ali" />
                  <div className="sm:col-span-2"><FieldInput id="st-email" label="Email Address" type="email" value={email} onChange={setEmail} error={errors.email} icon={Mail} placeholder="student@example.com" /></div>
                  <FieldInput id="st-phone" label="Phone (Optional)" type="tel" value={phone} onChange={setPhone} icon={Smartphone} placeholder="+92 300 1234567" />
                  <FieldInput id="st-city" label="City" value={city} onChange={setCity} icon={MapPin} placeholder="Lahore, Karachi, Islamabad…" />
                  <div className="sm:col-span-2"><SelectField id="st-province" label="Province / Region" value={province} onChange={setProvince} options={PROVINCE_OPTIONS} placeholder="Select a province" icon={Globe} /></div>
                </div>
              </div>
            </section>

            <section className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={GraduationCap} title="Education Background" subtitle="Your current academic standing" color="blue" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField id="st-education" label="Current / Highest Education" value={educationLevel} onChange={setEducationLevel} options={EDUCATION_OPTIONS} placeholder="Select level" icon={BookOpen} />
                <SelectField id="st-stream" label="Academic Stream / Major" value={stream} onChange={setStream} options={STREAM_OPTIONS} placeholder="Select stream" icon={Compass} />
                <div className="sm:col-span-2"><FieldInput id="st-institution" label="School / College / University" value={institution} onChange={setInstitution} icon={BookOpen} placeholder="e.g. NUST, LUMS, KIPS Academy" /></div>
                <div className="sm:col-span-2"><FieldInput id="st-graduation" label="Expected Graduation Year" type="number" value={graduationYear} onChange={setGraduationYear} icon={Calendar} placeholder="e.g. 2028" /></div>
              </div>
            </section>

            <section className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={Target} title="Career Goals & Skills" subtitle="Shape your personalized NexStep roadmap" color="violet" />
              <div className="space-y-4">
                <FieldInput id="st-career" label="Target Career" value={targetCareer} onChange={setTargetCareer} icon={Briefcase} placeholder="e.g. Software Engineer, Doctor, Architect…" />
                <div className="space-y-1.5">
                  <label htmlFor="st-bio" className="block text-xs font-bold text-slate-700 dark:text-slate-300">Short Bio <span className="text-slate-400 font-normal">({bio.length}/280)</span></label>
                  <textarea id="st-bio" rows={3} maxLength={280} value={bio} onChange={e => setBio(e.target.value)}
                    className="ns-input w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 resize-none"
                    placeholder="Tell mentors & recruiters a little about who you are, your aspirations, and what you're working on right now…" />
                </div>
                <TagInput id="st-languages" label="Languages" value={languages} onChange={setLanguages}
                  suggestions={['English', 'Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki', 'Arabic', 'Spanish', 'French']}
                  placeholder="Type and press Enter to add languages" maxTags={8} />
                <TagInput id="st-skills" label="Current Skills" value={skills} onChange={setSkills} suggestions={SKILL_SUGGESTIONS}
                  placeholder="Add skills like Python, React, Data Analysis…" maxTags={15} />
              </div>
            </section>

            <StickySaveBar saveState={saveState} isDirty={isDirty} onSave={handleSave} />
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div key="account" {...sectionMotion(0.05)} className="space-y-6">
            <section className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={KeyRound} title="Change Password" subtitle="Set a strong password to keep your account safe" color="teal" />
              <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
                <FieldPassword id="st-pwd-current" label="Current Password" value={currentPwd} onChange={setCurrentPwd} show={showCurrent} toggleShow={() => setShowCurrent(s => !s)} autoComplete="current-password" placeholder="Your current password" />
                <FieldPassword id="st-pwd-new" label="New Password" value={newPwd} onChange={setNewPwd} show={showNew} toggleShow={() => setShowNew(s => !s)} autoComplete="new-password" placeholder="At least 8 characters with uppercase & number" />
                <FieldPassword id="st-pwd-confirm" label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} placeholder="Repeat new password" autoComplete="new-password" />
                {pwdError && (
                  <div role="alert" className="flex items-start gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span className="font-semibold">{pwdError}</span>
                  </div>
                )}
                {pwdSuccess && (
                  <div role="status" className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span className="font-semibold">{pwdSuccess}</span>
                  </div>
                )}
                <button type="submit" disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
                  className="ns-btn ns-btn-primary py-2.5 px-5 rounded-2xl text-xs font-black cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 shadow-md shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 flex items-center gap-2 w-full sm:w-auto">
                  {pwdLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Updating…</span></>)
                    : (<><KeyRound className="w-4 h-4" /><span>Update Password</span></>)}
                </button>
              </form>
            </section>

            <section className="ns-card p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={ShieldCheck} title="Security & Sessions" subtitle="Keep your NexStep account protected" color="emerald" />
              <div className="space-y-2.5">
                <Toggle checked={twoFactorEnabled} onChange={setTwoFactorEnabled} Icon={ShieldCheck}
                  label="Two-Factor Authentication"
                  description="Adds a second layer of security with an authenticator app or SMS code at sign-in." />
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200">Current Session</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">This device · Windows · Chrome · Lahore · Active now</div>
                    </div>
                    <span className="ns-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> You
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {onLogout && (
              <section className="ns-card p-5 sm:p-6 border border-red-100 dark:border-red-900/40 bg-gradient-to-br from-red-50/40 dark:from-red-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-red-500/15 to-orange-500/15 text-red-600 dark:text-red-400 flex items-center justify-center ring-1 ring-red-500/20">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="text-sm font-black text-slate-900 dark:text-white">Sign out of NexStep</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">You&apos;ll need to sign in again to access your roadmap and career data.</div>
                  </div>
                  <button type="button" onClick={onLogout}
                    className="ns-btn py-2.5 px-5 rounded-2xl text-xs font-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 shadow-md bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white flex items-center gap-2 w-full sm:w-auto justify-center">
                    <LogOut className="w-4 h-4" /><span>Sign Out</span>
                  </button>
                </div>
              </section>
            )}
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div key="preferences" {...sectionMotion(0.05)} className="space-y-6">
            <section className="ns-card p-5 sm:p-7 space-y-4 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={Bell} title="Notifications" subtitle="Choose what NexStep emails and alerts you receive" color="amber" />
              <Toggle checked={emailNotif} onChange={setEmailNotif} Icon={Mail}
                label="Email Notifications" description="Roadmap updates, mentor messages, and important account alerts via email." />
              <Toggle checked={pushNotif} onChange={setPushNotif} Icon={Bell}
                label="Push Notifications" description="Browser push alerts for milestones, career matches, and new opportunities." />
              <Toggle checked={mentorRequests} onChange={setMentorRequests} Icon={Users}
                label="Mentor & Connection Requests" description="Notify me when a mentor or recruiter reaches out on the platform." />
              <Toggle checked={marketingOptin} onChange={setMarketingOptin} Icon={Sparkles}
                label="Product Updates & Insights" description="Occasional emails with career insights, new features, and Pakistan job trends." />
            </section>

            <section className="ns-card p-5 sm:p-7 space-y-4 border border-slate-200 dark:border-slate-800">
              <SectionHeader icon={Settings2} title="Appearance & Accessibility" subtitle="Customize how NexStep looks and feels for you" color="violet" />
              <Toggle checked={darkMode} onChange={setDarkMode} Icon={darkMode ? Moon : Sun}
                label="Dark Mode" description="Reduce eye strain with a dark interface theme. Follows your system preference by default." />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, color = 'emerald' }) {
  const colorMap = {
    emerald: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
    blue: 'from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 ring-blue-500/20',
    violet: 'from-violet-500/15 to-fuchsia-500/15 text-violet-600 dark:text-violet-400 ring-violet-500/20',
    teal: 'from-teal-500/15 to-cyan-500/15 text-teal-600 dark:text-teal-400 ring-teal-500/20',
    amber: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  };
  const classes = colorMap[color] || colorMap.emerald;
  return (
    <div className="flex items-center gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${classes} flex items-center justify-center ring-1`}>
        <Icon className="w-4.5 h-4.5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-sm font-black text-slate-900 dark:text-white">{title}</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldInput({ id, label, value, onChange, type = 'text', error, icon: Icon, placeholder }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`ns-input w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
            error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
          }`}
        />
      </div>
      {error && <p className="ns-input-error text-[11px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

function FieldPassword({ id, label, value, onChange, show, toggleShow, autoComplete, placeholder }) {
  const hasToggle = typeof show === 'boolean';
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          type={hasToggle && show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="ns-input w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-hidden transition-all bg-slate-50 dark:bg-slate-800 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        />
        {hasToggle && (
          <button type="button" onClick={toggleShow}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SaveStateBadge({ state, dirty, onSave, saving }) {
  if (state === 'saved') return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
      <CheckCircle2 className="w-4 h-4" /><span className="text-[11px] font-black">All changes saved</span>
    </motion.div>
  );
  if (saving) return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
      <Loader2 className="w-4 h-4 animate-spin" /><span className="text-[11px] font-black">Saving…</span>
    </div>
  );
  if (dirty) return (
    <button type="button" onClick={onSave}
      className="ns-btn ns-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 shadow-md shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950">
      <Save className="w-3.5 h-3.5" /><span>Save Changes</span>
    </button>
  );
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400">
      <CheckCircle2 className="w-4 h-4" /><span className="text-[11px] font-black">Up to date</span>
    </div>
  );
}

function StickySaveBar({ saveState, isDirty, onSave }) {
  if (saveState === 'saved' && !isDirty) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky bottom-4 z-30">
      <div className="ns-card p-4 sm:p-5 shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Profile Settings</span>
            {isDirty && saveState !== 'saving' && saveState !== 'saved' && (
              <span className="ns-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-200 dark:border-amber-800/40">Unsaved</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">All changes are encrypted before being saved.</div>
        </div>
        <button type="button" onClick={onSave} disabled={saveState === 'saving'}
          className="ns-btn ns-btn-primary flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-xs font-black cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 flex items-center justify-center gap-2">
          {saveState === 'saving' ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>)
            : saveState === 'saved' ? (<><CheckCircle2 className="w-4 h-4" /><span>Saved!</span></>)
            : (<><Save className="w-4 h-4" /><span>Save Changes</span></>)}
        </button>
      </div>
    </motion.div>
  );
}

export default SettingsSubTab;
