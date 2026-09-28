import React, { useState } from 'react';
import { 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Award, 
  Globe, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers,
  Brain,
  Zap,
  Target,
  Plus,
  X,
  Building2,
  FileText,
  Star,
  Check,
  Loader2,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { tr } from '../../utils/translator.js';

export function StudentOnboarding({ profile, onUpdateProfile, onNavigate, lang = 'en' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitializingAi, setIsInitializingAi] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Basic Information
    fullName: profile?.name || 'Muhammad Ali',
    email: profile?.email || 'student@nexstep.edu.pk',
    phone: profile?.phone || '+92 300 1234567',
    city: profile?.city || 'Islamabad',
    province: profile?.province || 'Islamabad',

    // Step 2: Academic History
    gradeLevel: profile?.gradeLevel || 'FSc / Inter (11-12)',
    boardSystem: 'BISE Federal Board (FBISE)',
    institutionName: 'Federal Government College, H-8',
    preferredStream: profile?.preferredStream || 'ICS (Comp Sci)',
    matricMarksPct: profile?.marks?.matricPct || 85,
    fscMarksPct: profile?.marks?.fscPct || 81,
    entryTestScore: profile?.marks?.entryTestScore || 78,

    // Step 3: Skill Sets & Proficiencies
    skills: [
      { name: 'Python Programming', level: 'Intermediate', category: 'Technical' },
      { name: 'Mathematics & Logic', level: 'Advanced', category: 'Academic' },
      { name: 'English Communication', level: 'Intermediate', category: 'Soft Skill' },
      { name: 'Problem Solving', level: 'Advanced', category: 'Soft Skill' }
    ],
    languages: ['English (Fluent)', 'Urdu (Native)'],
    certifications: ['Google Data Analytics Certificate', 'Science Olympiad Winner'],

    // Step 4: Career Interests & Financial Parameters
    targetIndustry: 'Software Engineering & Artificial Intelligence',
    targetRole: 'Full-Stack AI Developer / Data Scientist',
    workMode: 'Hybrid / Remote',
    preferredRegion: 'Pakistan & Overseas (Dual Degree)',
    familyMonthlyIncomePkr: profile?.familyMonthlyIncomePkr || 55000,
    budgetAnnualPkr: profile?.budgetAnnualPkr || 250000,
    needScholarship: true,

    // Resume
    resumeFileName: ''
  });

  // Local helpers for custom inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [newCert, setNewCert] = useState('');

  const stepsList = [
    { id: 1, title: 'Personal Info', desc: 'Basic student details', icon: UserCheck },
    { id: 2, title: 'Academic History', desc: 'Grades, board & stream', icon: GraduationCap },
    { id: 3, title: 'Skill Sets', desc: 'Proficiencies & certs', icon: Sparkles },
    { id: 4, title: 'Career Interests', desc: 'Aspirations & budget', icon: Target },
    { id: 5, title: 'AI Initialization', desc: 'Generate smart profile', icon: Brain }
  ];

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: newSkillName.trim(), level: newSkillLevel, category: newSkillCategory }]
      }));
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleAddCert = () => {
    if (newCert.trim()) {
      setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
      setNewCert('');
    }
  };

  const handleRemoveCert = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleInitializeAiProfile = () => {
    setIsInitializingAi(true);

    // Simulate multi-stage AI reasoning analysis
    setTimeout(() => {
      setIsInitializingAi(false);
      setAiInitialized(true);

      if (onUpdateProfile) {
        onUpdateProfile({
          name: formData.fullName,
          city: formData.city,
          province: formData.province,
          gradeLevel: formData.gradeLevel,
          preferredStream: formData.preferredStream,
          familyMonthlyIncomePkr: formData.familyMonthlyIncomePkr,
          budgetAnnualPkr: formData.budgetAnnualPkr,
          topRiasecCluster: 'I - Investigative (Scientific / Analytical)',
          marks: {
            matricPct: formData.matricMarksPct,
            fscPct: formData.fscMarksPct,
            entryTestScore: formData.entryTestScore
          }
        });
      }
    }, 1800);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      if (currentStep === 4) {
        // Move to step 5 and trigger AI generation
        setCurrentStep(5);
        handleInitializeAiProfile();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Onboarding Wizard Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                AI Profile Setup Engine
              </span>
              <span className="text-slate-400 text-xs">| Step {currentStep} of 5</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Career Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Initialize your personalized AI profile with academic history, technical skill sets, and career ambitions to unlock custom roadmaps.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">Profile Readiness</div>
              <div className="text-lg font-black text-emerald-400">{currentStep * 20}% Completed</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-sm">
              {currentStep}/5
            </div>
          </div>
        </div>

        {/* Step Progress Tracker Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-5 gap-2">
            {stepsList.map((st) => {
              const StepIcon = st.icon;
              const isActive = st.id === currentStep;
              const isDone = st.id < currentStep || aiInitialized;

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    if (st.id < currentStep || aiInitialized) setCurrentStep(st.id);
                  }}
                  className={`flex flex-col items-center gap-1 text-center p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : isDone
                      ? 'bg-slate-800 text-emerald-400 font-bold hover:bg-slate-700'
                      : 'bg-slate-800/40 text-slate-500 font-medium opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs">
                    <StepIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline text-[11px] font-extrabold">{st.title}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden mt-1">
                    <div 
                      className={`h-full transition-all ${
                        isActive ? 'bg-slate-950' : isDone ? 'bg-emerald-400' : 'bg-transparent'
                      }`}
                      style={{ width: isActive ? '100%' : isDone ? '100%' : '0%' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        
        {/* STEP 1: PERSONAL & BASIC INFO */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Step 1: Personal Identification & Contact</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter basic profile details to customize your official academic reports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City of Residence
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Islamabad, Lahore, Karachi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Province / Domicile Region
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Islamabad">Islamabad Capital Territory (ICT)</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Gilgit Baltistan">Gilgit-Baltistan</option>
                  <option value="AJK">Azad Jammu & Kashmir (AJK)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC HISTORY */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Step 2: Academic History & Qualification Parameters</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Collects your board exam scores and academic stream to calculate exact university merit aggregates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Grade / Education Level
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Grade 8 (Middle School)">Grade 8 (Middle School)</option>
                  <option value="Matric / O-Levels (9-10)">Matric / O-Levels (9-10)</option>
                  <option value="FSc / Inter (11-12)">FSc / Inter (11-12)</option>
                  <option value="Undergraduate (BS / University)">Undergraduate (BS / University)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Educational Board / Examination System
                </label>
                <select
                  value={formData.boardSystem}
                  onChange={(e) => setFormData({ ...formData, boardSystem: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="BISE Federal Board (FBISE)">BISE Federal Board (FBISE)</option>
                  <option value="BISE Rawalpindi / Punjab Boards">BISE Rawalpindi / Punjab Boards</option>
                  <option value="BISE Karachi / Sindh Boards">BISE Karachi / Sindh Boards</option>
                  <option value="Cambridge O/A-Levels (CAIE)">Cambridge O/A-Levels (CAIE)</option>
                  <option value="Aga Khan University Examination Board">Aga Khan Board (AKU-EB)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School / College / University Name
                </label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="e.g. Army Public School, Cadet College, FG College"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred / Active Academic Stream
                </label>
                <select
                  value={formData.preferredStream}
                  onChange={(e) => setFormData({ ...formData, preferredStream: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="ICS (Comp Sci)">ICS (Computer Science, Math, Physics)</option>
                  <option value="Pre-Engineering">FSc Pre-Engineering (Math, Physics, Chem)</option>
                  <option value="Pre-Medical">FSc Pre-Medical (Biology, Physics, Chem)</option>
                  <option value="ICOM / Commerce">ICOM / Commerce & Accounting</option>
                  <option value="FA / Humanities">FA / Humanities & Social Sciences</option>
                  <option value="TEVTA Diploma">TEVTA Technical Diploma (DAE)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 sm:col-span-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  Academic Scores & Entry Test Performance (%)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Matric Marks (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.matricMarksPct}
                      onChange={(e) => setFormData({ ...formData, matricMarksPct: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">FSc / Inter (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.fscMarksPct}
                      onChange={(e) => setFormData({ ...formData, fscMarksPct: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Entry Test Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.entryTestScore}
                      onChange={(e) => setFormData({ ...formData, entryTestScore: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SKILL SETS & PROFICIENCIES */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Step 3: Skill Sets, Certifications & Proficiencies</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Map your current technical, academic, and soft skills to detect job readiness gaps.
              </p>
            </div>

            {/* Add Custom Skill Builder */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">Add a Skill or Competency</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Skill name (e.g. C++, Graphic Design)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="sm:col-span-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium"
                />

                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* Active Skills List Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Your Added Skills ({formData.skills.length})</label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
                  >
                    <span>{s.name}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-200 dark:bg-emerald-900 text-[10px] font-black uppercase">
                      {s.level}
                    </span>
                    <button onClick={() => handleRemoveSkill(idx)} className="text-emerald-600 dark:text-emerald-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications & Extracurriculars */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Certifications & Extracurricular Accomplishments</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Science Fair Winner, Python Certificate, Debating Society President"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-extrabold cursor-pointer"
                >
                  Add Cert
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {formData.certifications.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{c}</span>
                    <button onClick={() => handleRemoveCert(i)} className="text-slate-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CAREER INTERESTS & BUDGET */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Step 4: Career Goals, Work Mode & Scholarship Budget</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Define your dream career path and financial limits to customize scholarship filters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Industry / Field
                </label>
                <select
                  value={formData.targetIndustry}
                  onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Software Engineering & Artificial Intelligence">Software Engineering & AI</option>
                  <option value="Healthcare, Medicine & Bio-Tech">Healthcare & Bio-Tech</option>
                  <option value="Mechanical & Robotics Engineering">Robotics & Mechatronics</option>
                  <option value="Finance, Fintech & Banking">Fintech & Financial Analytics</option>
                  <option value="Media, UI/UX & Digital Marketing">Digital Media & Product Design</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Work Mode
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Hybrid / Remote">Hybrid / Remote Work</option>
                  <option value="In-Person Office / Lab">In-Person Office / Lab</option>
                  <option value="Global Remote Freelancing">Global Remote Freelancing</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  University / Career Destination Preference
                </label>
                <select
                  value={formData.preferredRegion}
                  onChange={(e) => setFormData({ ...formData, preferredRegion: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Pakistan & Overseas (Dual Degree)">Pakistan HEC & Dual Degree Transnational</option>
                  <option value="Top Pakistan Universities (NUST, FAST, LUMS, GIKI)">Top Pakistan Public/Private Institutes</option>
                  <option value="Study Abroad (UK, USA, Europe, China)">Study Abroad (UK, USA, Europe, China)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Family Income (PKR)
                </label>
                <input
                  type="number"
                  value={formData.familyMonthlyIncomePkr}
                  onChange={(e) => setFormData({ ...formData, familyMonthlyIncomePkr: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Used for Ehsaas, PEEF & HEC need-based grant matches</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Tuition Budget Capacity (PKR)
                </label>
                <input
                  type="number"
                  value={formData.budgetAnnualPkr}
                  onChange={(e) => setFormData({ ...formData, budgetAnnualPkr: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: AI PROFILE INITIALIZATION & SUMMARY */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isInitializingAi ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-pulse">
                  <Brain className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Initializing NexStep AI Student Engine...
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Computing RIASEC Holland personality codes, matching 180+ university merit cutoffs, and generating custom career roadmaps.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                      AI Profile Initialized Successfully!
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Your career profile is now active across all 30 NexStep platform modules.
                    </p>
                  </div>
                </div>

                {/* AI Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Primary Personality Trait
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Investigative & Analytical ( Holland RIASEC )
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Matches well with Software Engineering, Data Science, and Quantitative Finance.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      University Eligibility Matched
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      24 Accredited Universities Eligible
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      NUST, FAST-NU, Air University, and ITU Lahore match your current merit aggregate (82.4%).
                    </p>
                  </div>
                </div>

                {/* Profile Overview List */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    Profile Data Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Student Name</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formData.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Grade / Stream</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formData.gradeLevel}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Location</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formData.city}, {formData.province}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Skills Registered</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formData.skills.length} Skills</strong>
                    </div>
                  </div>
                </div>

                {/* Final Navigation Controls */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('dashboard');
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Go to Student Intelligence Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('careerAi');
                    }}
                    className="py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>View AI Career Engine</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step Navigation Button Bar */}
        {currentStep < 5 && (
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold disabled:opacity-40 flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>{currentStep === 4 ? 'Initialize AI Profile' : 'Continue to Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentOnboarding;
