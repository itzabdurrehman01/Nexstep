import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Download, Plus, Trash2, ChevronDown, ChevronRight,
  X, Mail, Phone, MapPin, Linkedin, Globe, Printer,
  RotateCcw, User, GraduationCap, Briefcase, Code2,
  FolderKanban, Award, AlignLeft, Eye, Edit3
} from 'lucide-react';

const STORAGE_KEY = 'nexstep_resume_data';

const defaultResumeData = {
  personal: {
    fullName: 'Muhammad Ali',
    jobTitle: 'Computer Science Student & Aspiring Software Engineer',
    email: 'ali.student@nexstep.edu.pk',
    phone: '+92 300 1234567',
    city: 'Islamabad, Pakistan',
    linkedin: 'linkedin.com/in/muhammad-ali',
    portfolio: 'muhammadali.dev'
  },
  objective: 'Enthusiastic and analytical FSc/ICS graduate looking to pursue BS Computer Science at a top-tier Pakistani university. Strong background in Python programming, web development, and mathematical problem solving. Eager to apply technical skills to real-world projects and contribute to innovative software solutions.',
  education: [
    {
      id: 'edu-1',
      institution: 'FBISE Federal College Islamabad',
      degree: 'FSc (ICS / Computer Science)',
      yearRange: '2024 - 2026',
      cgpa: '82% Percentage',
      description: 'Focused on computer science fundamentals including programming, data structures, and discrete mathematics. Active member of the Computer Science Society.'
    },
    {
      id: 'edu-2',
      institution: 'Army Public School Islamabad',
      degree: 'Matriculation (Science Group)',
      yearRange: '2022 - 2024',
      cgpa: '88% Percentage',
      description: 'Top 10% of graduating class. Excelled in mathematics, physics, and computer studies. Recipient of Academic Excellence Award.'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'NexStep AI Lab',
      role: 'Junior Software Developer Intern',
      dateRange: 'Jun 2026 - Aug 2026',
      bullets: [
        'Built a student merit calculator web app using React and the Gemini API, serving 500+ BISE students',
        'Implemented responsive UI components with Tailwind CSS, improving mobile usability by 40%',
        'Collaborated with senior devs on backend API endpoints using Node.js and Express'
      ]
    }
  ],
  skills: [
    'Python Programming',
    'HTML/CSS/JavaScript',
    'React.js',
    'Data Structures & Algorithms',
    'SQL / Databases',
    'Problem Solving',
    'Team Collaboration',
    'Technical Writing'
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'NexStep Career Counselor Prototype',
      techStack: ['React', 'Gemini API', 'Tailwind CSS', 'Node.js'],
      link: 'github.com/nexstep/career-counselor',
      description: 'AI-powered career guidance platform for Pakistani intermediate students. Features personality assessment, career matching, and personalized roadmap generation.'
    },
    {
      id: 'proj-2',
      title: 'Student Merit & Aggregate Calculator',
      techStack: ['Python', 'Flask', 'Bootstrap'],
      link: '',
      description: 'Web application to calculate BISE merit aggregates for university admissions. Supports multiple entry test formulas (NUST, FAST, GIKI).'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Python for Everybody Specialization',
      issuer: 'Coursera / University of Michigan',
      year: '2025',
      link: 'coursera.org/verify/specialization/xyz123'
    },
    {
      id: 'cert-2',
      name: 'Responsive Web Design',
      issuer: 'freeCodeCamp',
      year: '2025',
      link: ''
    }
  ]
};

function skillName(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') return String(value.name ?? value.skill ?? value.title ?? '').trim();
  return '';
}

function normalizeSkills(value, fallback = defaultResumeData.skills) {
  const source = Array.isArray(value) ? value : fallback;
  return [...new Set(source.map(skillName).filter(Boolean))];
}

function normalizeResumeData(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    ...defaultResumeData,
    ...value,
    personal: { ...defaultResumeData.personal, ...(value.personal ?? {}) },
    education: Array.isArray(value.education) ? value.education : defaultResumeData.education,
    experience: (Array.isArray(value.experience) ? value.experience : defaultResumeData.experience)
      .map((entry) => ({ ...entry, bullets: Array.isArray(entry?.bullets) ? entry.bullets : [] })),
    skills: normalizeSkills(value.skills),
    projects: (Array.isArray(value.projects) ? value.projects : defaultResumeData.projects)
      .map((entry) => ({ ...entry, techStack: Array.isArray(entry?.techStack) ? entry.techStack : [] })),
    certifications: Array.isArray(value.certifications) ? value.certifications : defaultResumeData.certifications,
  };
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function AccordionSection({ title, icon: Icon, isOpen, onToggle, children, countBadge }) {
  return (
    <div className="ns-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer hover:bg-[var(--ns-surface-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ns-primary-500)] focus-visible:ring-inset"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--ns-primary-100)] dark:bg-[var(--ns-primary-900)]/30 text-[var(--ns-primary-700)] dark:text-[var(--ns-primary-400)] flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-[var(--ns-text)] truncate">{title}</h3>
          </div>
          {typeof countBadge === 'number' && countBadge > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full bg-[var(--ns-accent-100)] dark:bg-[var(--ns-accent-900)]/40 text-[var(--ns-accent-700)] dark:text-[var(--ns-accent-400)] text-[10px] font-black shrink-0">
              {countBadge}
            </span>
          )}
        </div>
        <div className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown className="w-4.5 h-4.5 text-[var(--ns-text-subtle)]" />
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--ns-border-soft)]">
          {children}
        </div>
      )}
    </div>
  );
}

function SkillsTagInput({ skills, onChange }) {
  const safeSkills = normalizeSkills(skills, []);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addSkill = (raw) => {
    const val = raw.trim().replace(/,$/, '').trim();
    if (!val) return;
    if (safeSkills.some(s => s.toLowerCase() === val.toLowerCase())) return;
    onChange([...safeSkills, val]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(e.target.value);
      setInput('');
    } else if (e.key === 'Backspace' && !e.target.value && safeSkills.length > 0) {
      onChange(safeSkills.slice(0, -1));
    }
  };

  const removeSkill = (idx) => {
    onChange(safeSkills.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2.5">
      <label className="ns-input-label">Core Skills</label>
      <div className="ns-input flex flex-wrap gap-1.5 min-h-[44px] items-center">
        {safeSkills.map((s, i) => (
          <span key={i} className="ns-tag pr-1.5 gap-1.5">
            {s}
            <button
              onClick={(e) => { e.stopPropagation(); removeSkill(i); }}
              className="w-4 h-4 rounded-full hover:bg-[var(--ns-danger-bg)] text-[var(--ns-text-subtle)] hover:text-[var(--ns-danger)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              aria-label={`Remove ${s}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { if (input) { addSkill(input); setInput(''); } }}
          placeholder={safeSkills.length === 0 ? 'Type a skill, press Enter or comma...' : 'Add more...'}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[var(--ns-text)] placeholder:text-[var(--ns-text-faint)] text-sm py-1"
        />
      </div>
      <span className="ns-input-helper">Press Enter or comma to add • Click × to remove</span>
    </div>
  );
}

export function ResumeTab({ profile, lang = 'en' }) {
  const [openSections, setOpenSections] = useState({
    personal: true,
    objective: true,
    education: true,
    experience: false,
    skills: true,
    projects: false,
    certifications: false
  });
  const [mobileView, setMobileView] = useState('edit');
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const normalized = normalizeResumeData(JSON.parse(saved));
        if (normalized) return normalized;
      }
    } catch {}
    return {
      ...defaultResumeData,
      personal: {
        ...defaultResumeData.personal,
        fullName: profile?.name || defaultResumeData.personal.fullName,
        city: profile?.city ? `${profile.city}, Pakistan` : defaultResumeData.personal.city
      },
      skills: Array.isArray(profile?.skills) && profile.skills.length > 0
        ? normalizeSkills([...profile.skills, ...defaultResumeData.skills])
        : defaultResumeData.skills
    };
  });

  useEffect(() => {
    if (!loadedFromStorage) {
      setLoadedFromStorage(true);
      return;
    }
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      } catch {}
    }, 400);
    return () => clearTimeout(timeout);
  }, [resumeData, loadedFromStorage]);

  const toggleSection = (k) => setOpenSections(prev => ({ ...prev, [k]: !prev[k] }));

  const updatePersonal = (key, val) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [key]: val } }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: genId('edu'),
        institution: 'New Institution Name',
        degree: 'Degree / Diploma',
        yearRange: '2024 - 2026',
        cgpa: '',
        description: ''
      }]
    }));
    setOpenSections(p => ({ ...p, education: true }));
  };

  const updateEducation = (id, key, val) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [key]: val } : e)
    }));
  };

  const removeEducation = (id) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: genId('exp'),
        company: 'Company Name',
        role: 'Job Title / Role',
        dateRange: 'Jan 2026 - Present',
        bullets: ['Describe your key responsibilities and achievements']
      }]
    }));
    setOpenSections(p => ({ ...p, experience: true }));
  };

  const updateExperience = (id, key, val) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [key]: val } : e)
    }));
  };

  const updateExpBullet = (expId, bulletIdx, val) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e;
        const newBullets = [...e.bullets];
        newBullets[bulletIdx] = val;
        return { ...e, bullets: newBullets };
      })
    }));
  };

  const addExpBullet = (expId) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, 'New achievement or responsibility'] } : e
      )
    }));
  };

  const removeExpBullet = (expId, bulletIdx) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e;
        if (e.bullets.length <= 1) return e;
        return { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) };
      })
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: genId('proj'),
        title: 'Project Title',
        techStack: [],
        link: '',
        description: 'Brief description of the project, your role, and key outcomes.'
      }]
    }));
    setOpenSections(p => ({ ...p, projects: true }));
  };

  const updateProject = (id, key, val) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [key]: val } : p)
    }));
  };

  const removeProject = (id) => {
    setResumeData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: genId('cert'),
        name: 'Certification Name',
        issuer: 'Issuing Organization',
        year: '2026',
        link: ''
      }]
    }));
    setOpenSections(p => ({ ...p, certifications: true }));
  };

  const updateCert = (id, key, val) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [key]: val } : c)
    }));
  };

  const removeCert = (id) => {
    setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  const handlePrint = useCallback(() => {
    try { document.body.classList.add('printing-resume'); } catch {}
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        try { document.body.classList.remove('printing-resume'); } catch {}
      }, 500);
    }, 150);
  }, []);

  const handleReset = () => {
    const reset = {
      ...defaultResumeData,
      personal: {
        ...defaultResumeData.personal,
        fullName: profile?.name || defaultResumeData.personal.fullName,
        city: profile?.city ? `${profile.city}, Pakistan` : defaultResumeData.personal.city
      }
    };
    setResumeData(reset);
  };

  const handleImportFromProfile = () => {
    setResumeData(prev => {
      const next = { ...prev, personal: { ...prev.personal } };
      if (profile?.name) next.personal.fullName = profile.name;
      if (profile?.city) next.personal.city = `${profile.city}, Pakistan`;
      if (profile?.email) next.personal.email = profile.email;
      if (profile?.phone) next.personal.phone = profile.phone;
      if (Array.isArray(profile?.skills) && profile.skills.length > 0) {
        next.skills = normalizeSkills([...profile.skills, ...prev.skills]);
      }
      if (profile?.goals) {
        next.objective = prev.objective === defaultResumeData.objective
          ? `${profile.goals}. ${defaultResumeData.objective}`
          : prev.objective;
      }
      return next;
    });
  };

  const { personal, objective, education, experience, skills, projects, certifications } = resumeData;

  const editorPanel = (
    <div className="space-y-3">
      <AccordionSection
        title="Personal Information"
        icon={User}
        isOpen={openSections.personal}
        onToggle={() => toggleSection('personal')}
      >
        <div className="pt-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="ns-input-label">Full Name</label>
              <input type="text" className="ns-input" value={personal.fullName}
                onChange={(e) => updatePersonal('fullName', e.target.value)} />
            </div>
            <div>
              <label className="ns-input-label">Job Title / Subtitle</label>
              <input type="text" className="ns-input" value={personal.jobTitle}
                onChange={(e) => updatePersonal('jobTitle', e.target.value)} />
            </div>
            <div>
              <label className="ns-input-label">Email</label>
              <input type="email" className="ns-input" value={personal.email}
                onChange={(e) => updatePersonal('email', e.target.value)} />
            </div>
            <div>
              <label className="ns-input-label">Phone</label>
              <input type="tel" className="ns-input" value={personal.phone}
                onChange={(e) => updatePersonal('phone', e.target.value)} />
            </div>
            <div>
              <label className="ns-input-label">City / Location</label>
              <input type="text" className="ns-input" value={personal.city}
                onChange={(e) => updatePersonal('city', e.target.value)} />
            </div>
            <div>
              <label className="ns-input-label">LinkedIn</label>
              <input type="text" className="ns-input" value={personal.linkedin}
                onChange={(e) => updatePersonal('linkedin', e.target.value)}
                placeholder="linkedin.com/in/your-profile" />
            </div>
            <div className="sm:col-span-2">
              <label className="ns-input-label">Portfolio / Website</label>
              <input type="text" className="ns-input" value={personal.portfolio}
                onChange={(e) => updatePersonal('portfolio', e.target.value)}
                placeholder="yourdomain.dev or github.com/username" />
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Professional Objective / Summary"
        icon={AlignLeft}
        isOpen={openSections.objective}
        onToggle={() => toggleSection('objective')}
      >
        <div className="pt-3 space-y-2">
          <textarea
            className="ns-textarea"
            rows={4}
            value={objective}
            onChange={(e) => setResumeData(prev => ({ ...prev, objective: e.target.value }))}
            placeholder="A concise 2-3 sentence summary about your background, goals, and key strengths..."
          />
          <span className="ns-input-helper">{objective.length} characters · Keep it focused and professional</span>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Education"
        icon={GraduationCap}
        isOpen={openSections.education}
        onToggle={() => toggleSection('education')}
        countBadge={education.length}
      >
        <div className="pt-3 space-y-3.5">
          {education.map((edu, idx) => (
            <div key={edu.id} className="p-3.5 rounded-2xl bg-[var(--ns-surface-2)] border border-[var(--ns-border)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--ns-text-subtle)]">
                  Entry {idx + 1}
                </span>
                <button
                  onClick={() => removeEducation(edu.id)}
                  disabled={education.length <= 1}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--ns-danger)] bg-[var(--ns-danger-bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="ns-input-label">Degree / Qualification</label>
                  <input type="text" className="ns-input" value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className="ns-input-label">Institution</label>
                  <input type="text" className="ns-input" value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className="ns-input-label">Year Range</label>
                  <input type="text" className="ns-input" value={edu.yearRange}
                    onChange={(e) => updateEducation(edu.id, 'yearRange', e.target.value)}
                    placeholder="2022 - 2024" />
                </div>
                <div>
                  <label className="ns-input-label">CGPA / Percentage / Marks</label>
                  <input type="text" className="ns-input" value={edu.cgpa}
                    onChange={(e) => updateEducation(edu.id, 'cgpa', e.target.value)}
                    placeholder="3.8 CGPA / 85%" />
                </div>
                <div className="sm:col-span-2">
                  <label className="ns-input-label">Description (optional)</label>
                  <textarea className="ns-textarea" rows={2} value={edu.description}
                    onChange={(e) => updateEducation(edu.id, 'description', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addEducation}
            className="w-full ns-btn ns-btn-secondary justify-center py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Education Entry
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Experience"
        icon={Briefcase}
        isOpen={openSections.experience}
        onToggle={() => toggleSection('experience')}
        countBadge={experience.length}
      >
        <div className="pt-3 space-y-3.5">
          {experience.map((exp, idx) => (
            <div key={exp.id} className="p-3.5 rounded-2xl bg-[var(--ns-surface-2)] border border-[var(--ns-border)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--ns-text-subtle)]">
                  Role {idx + 1}
                </span>
                <button
                  onClick={() => removeExperience(exp.id)}
                  disabled={experience.length <= 1}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--ns-danger)] bg-[var(--ns-danger-bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="ns-input-label">Role / Position</label>
                  <input type="text" className="ns-input" value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                </div>
                <div>
                  <label className="ns-input-label">Company / Organization</label>
                  <input type="text" className="ns-input" value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="ns-input-label">Date Range</label>
                  <input type="text" className="ns-input" value={exp.dateRange}
                    onChange={(e) => updateExperience(exp.id, 'dateRange', e.target.value)}
                    placeholder="Jan 2026 - Present" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="ns-input-label mb-0">Key Achievements / Responsibilities</label>
                  <button
                    onClick={() => addExpBullet(exp.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--ns-primary-700)] dark:text-[var(--ns-primary-400)] bg-[var(--ns-primary-100)] dark:bg-[var(--ns-primary-900)]/30 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Bullet
                  </button>
                </div>
                <div className="space-y-1.5">
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[var(--ns-primary-500)] text-white shrink-0 mt-2.5 flex items-center justify-center text-[9px] font-black">
                        {bIdx + 1}
                      </span>
                      <div className="flex-1 flex items-start gap-1.5">
                        <textarea
                          className="ns-textarea flex-1"
                          rows={2}
                          value={b}
                          onChange={(e) => updateExpBullet(exp.id, bIdx, e.target.value)}
                        />
                        <button
                          onClick={() => removeExpBullet(exp.id, bIdx)}
                          disabled={exp.bullets.length <= 1}
                          className="shrink-0 w-8 h-8 rounded-lg mt-0.5 flex items-center justify-center text-[var(--ns-text-subtle)] hover:text-[var(--ns-danger)] hover:bg-[var(--ns-danger-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label="Remove bullet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addExperience}
            className="w-full ns-btn ns-btn-secondary justify-center py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Experience Entry
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Core Skills"
        icon={Code2}
        isOpen={openSections.skills}
        onToggle={() => toggleSection('skills')}
        countBadge={skills.length}
      >
        <div className="pt-3">
          <SkillsTagInput skills={skills} onChange={(s) => setResumeData(prev => ({ ...prev, skills: s }))} />
        </div>
      </AccordionSection>

      <AccordionSection
        title="Projects"
        icon={FolderKanban}
        isOpen={openSections.projects}
        onToggle={() => toggleSection('projects')}
        countBadge={projects.length}
      >
        <div className="pt-3 space-y-3.5">
          {projects.map((proj, idx) => (
            <div key={proj.id} className="p-3.5 rounded-2xl bg-[var(--ns-surface-2)] border border-[var(--ns-border)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--ns-text-subtle)]">
                  Project {idx + 1}
                </span>
                <button
                  onClick={() => removeProject(proj.id)}
                  disabled={projects.length <= 1}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--ns-danger)] bg-[var(--ns-danger-bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="ns-input-label">Project Title</label>
                  <input type="text" className="ns-input" value={proj.title}
                    onChange={(e) => updateProject(proj.id, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="ns-input-label">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    className="ns-input"
                    value={proj.techStack.join(', ')}
                    onChange={(e) => updateProject(proj.id, 'techStack',
                      e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="ns-input-label">Link (optional)</label>
                  <input type="text" className="ns-input" value={proj.link}
                    onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                    placeholder="github.com/your/project" />
                </div>
                <div>
                  <label className="ns-input-label">Description</label>
                  <textarea className="ns-textarea" rows={3} value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addProject}
            className="w-full ns-btn ns-btn-secondary justify-center py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Certifications"
        icon={Award}
        isOpen={openSections.certifications}
        onToggle={() => toggleSection('certifications')}
        countBadge={certifications.length}
      >
        <div className="pt-3 space-y-3.5">
          {certifications.map((cert, idx) => (
            <div key={cert.id} className="p-3.5 rounded-2xl bg-[var(--ns-surface-2)] border border-[var(--ns-border)] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--ns-text-subtle)]">
                  Cert {idx + 1}
                </span>
                <button
                  onClick={() => removeCert(cert.id)}
                  disabled={certifications.length <= 1}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--ns-danger)] bg-[var(--ns-danger-bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="ns-input-label">Certification Name</label>
                  <input type="text" className="ns-input" value={cert.name}
                    onChange={(e) => updateCert(cert.id, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="ns-input-label">Issuer / Platform</label>
                  <input type="text" className="ns-input" value={cert.issuer}
                    onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)} />
                </div>
                <div>
                  <label className="ns-input-label">Year</label>
                  <input type="text" className="ns-input" value={cert.year}
                    onChange={(e) => updateCert(cert.id, 'year', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="ns-input-label">Credential URL (optional)</label>
                  <input type="text" className="ns-input" value={cert.link}
                    onChange={(e) => updateCert(cert.id, 'link', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addCertification}
            className="w-full ns-btn ns-btn-secondary justify-center py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      </AccordionSection>
    </div>
  );

  const previewPanel = (
    <div className="flex flex-col h-full">
      <div className="flex lg:hidden items-center justify-between mb-4">
        <div className="flex items-center gap-2 ns-card p-1 rounded-xl">
          <button
            onClick={() => setMobileView('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileView === 'edit'
                ? 'bg-[var(--ns-primary-600)] text-white shadow-sm'
                : 'text-[var(--ns-text-muted)] hover:text-[var(--ns-text)]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 inline mr-1.5" /> Edit
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileView === 'preview'
                ? 'bg-[var(--ns-primary-600)] text-white shadow-sm'
                : 'text-[var(--ns-text-muted)] hover:text-[var(--ns-text)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1.5" /> Preview
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center lg:sticky lg:top-4 lg:self-start overflow-auto lg:max-h-[calc(100vh-120px)] py-2">
        <div className="w-full max-w-[210mm]">
          <div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            style={{ aspectRatio: '1 / 1.414' }}
          >
            <div
              id="resume-print-area"
              className="w-full h-full p-8 sm:p-10 text-slate-900 overflow-hidden"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
            >
              <div className="h-full flex flex-col space-y-4 resume-section">
                <header className="pb-4 border-b-2 border-slate-900">
                  <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 uppercase leading-tight">
                    {personal.fullName || 'Your Name Here'}
                  </h1>
                  {personal.jobTitle && (
                    <p className="text-sm font-semibold text-slate-600 mt-1 tracking-wide">
                      {personal.jobTitle}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-600">
                    {personal.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {personal.email}
                      </span>
                    )}
                    {personal.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {personal.phone}
                      </span>
                    )}
                    {personal.city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {personal.city}
                      </span>
                    )}
                    {personal.linkedin && (
                      <span className="inline-flex items-center gap-1.5">
                        <Linkedin className="w-3 h-3 text-slate-500" />
                        {personal.linkedin}
                      </span>
                    )}
                    {personal.portfolio && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {personal.portfolio}
                      </span>
                    )}
                  </div>
                </header>

                {objective && (
                  <section className="space-y-1.5 resume-section">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900 border-b border-slate-200 pb-1">
                      Professional Summary
                    </h2>
                    <p className="text-[11.5px] leading-relaxed text-slate-700">
                      {objective}
                    </p>
                  </section>
                )}

                {education.length > 0 && (
                  <section className="space-y-2.5 resume-section">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900 border-b border-slate-200 pb-1">
                      Education
                    </h2>
                    <div className="space-y-2.5">
                      {education.map((edu) => (
                        <div key={edu.id} className="space-y-0.5">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                                {edu.degree}
                              </p>
                              <p className="text-[11px] text-slate-600 font-medium">
                                {edu.institution}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {edu.cgpa && (
                                <p className="text-[11px] font-bold text-emerald-700">
                                  {edu.cgpa}
                                </p>
                              )}
                              <p className="text-[10.5px] text-slate-500 font-medium">
                                {edu.yearRange}
                              </p>
                            </div>
                          </div>
                          {edu.description && (
                            <p className="text-[10.5px] text-slate-600 leading-relaxed pt-0.5">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {experience.length > 0 && (
                  <section className="space-y-2.5 resume-section">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900 border-b border-slate-200 pb-1">
                      Experience
                    </h2>
                    <div className="space-y-3">
                      {experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                                {exp.role}
                              </p>
                              <p className="text-[11px] text-slate-600 font-medium">
                                {exp.company}
                              </p>
                            </div>
                            <p className="text-[10.5px] text-slate-500 font-medium shrink-0 text-right">
                              {exp.dateRange}
                            </p>
                          </div>
                          {exp.bullets.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {exp.bullets.filter(Boolean).map((b, bi) => (
                                <li
                                  key={bi}
                                  className="text-[10.5px] text-slate-700 leading-relaxed pl-3.5 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400 before:font-black"
                                >
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {projects.length > 0 && (
                  <section className="space-y-2.5 resume-section">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900 border-b border-slate-200 pb-1">
                      Projects
                    </h2>
                    <div className="space-y-2.5">
                      {projects.map((proj) => (
                        <div key={proj.id} className="space-y-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                              {proj.title}
                            </p>
                            {proj.link && (
                              <p className="text-[10px] text-blue-700 font-semibold shrink-0 underline-offset-2">
                                {proj.link}
                              </p>
                            )}
                          </div>
                          {proj.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {proj.techStack.map((t, ti) => (
                                <span
                                  key={ti}
                                  className="resume-skill-tag inline-flex px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-700 text-[9.5px] font-semibold"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {proj.description && (
                            <p className="text-[10.5px] text-slate-700 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {certifications.length > 0 && (
                  <section className="space-y-2 resume-section">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900 border-b border-slate-200 pb-1">
                      Certifications
                    </h2>
                    <div className="space-y-1">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="flex justify-between items-start gap-3 text-[10.5px]">
                          <div>
                            <span className="font-bold text-slate-900">{cert.name}</span>
                            <span className="text-slate-600"> · {cert.issuer}</span>
                          </div>
                          <span className="text-slate-500 font-medium shrink-0">{cert.year}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {skills.length > 0 && (
                  <section className="space-y-2 resume-section">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900 border-b border-slate-200 pb-1">
                      Core Skills
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, si) => (
                        <span
                          key={si}
                          className="resume-skill-tag px-2.5 py-1 rounded-md border border-slate-300 bg-slate-50 text-slate-700 text-[10px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[22rem] h-[22rem] rounded-full bg-indigo-500/5 blur-3xl" />
        </div>
        <div className="relative z-10 p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">AI Resume Builder</h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Professional A4 resumes tailored for admissions, internships & jobs
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleImportFromProfile}
              className="ns-btn ns-btn-ghost bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] px-3 py-2 rounded-xl"
            >
              <User className="w-3.5 h-3.5" /> Import From Profile
            </button>
            <button
              onClick={handleReset}
              className="ns-btn ns-btn-ghost bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] px-3 py-2 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Template
            </button>
            <button
              onClick={handlePrint}
              className="ns-btn ns-btn-primary bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-[11px] px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none justify-center"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        <div className={`${mobileView === 'preview' && !window.matchMedia('(min-width: 1024px)').matches ? 'hidden lg:block' : ''} lg:block order-2 lg:order-1`}>
          <div className="lg:sticky lg:top-4 space-y-3 max-h-[calc(100vh-120px)] overflow-auto pr-1">
            {editorPanel}
          </div>
        </div>
        <div className={`${mobileView === 'edit' && !window.matchMedia('(min-width: 1024px)').matches ? 'hidden lg:block' : ''} lg:block order-1 lg:order-2`}>
          {previewPanel}
        </div>
      </div>
    </div>
  );
}
