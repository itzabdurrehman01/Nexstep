import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Sparkles, 
  Compass, 
  FileText, 
  TrendingUp, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Bot, 
  Sliders, 
  Mic, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Globe, 
  BookOpen, 
  Award, 
  Wrench,
  ArrowRight
} from 'lucide-react';
import { tr } from '../utils/translator.js';

export function CommandPaletteModal({ isOpen, onClose, onSelectTab, lang = 'en' }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allItems = [
    { id: 'dashboard', label: 'Student Portal Dashboard', category: 'MAIN', icon: Compass, desc: 'Central hub & AI metrics' },
    { id: 'careerAi', label: 'AI Career Recommendation', category: 'MAIN', icon: Sparkles, desc: 'Personalized career matching' },
    { id: 'careerRoadmap', label: 'Career Roadmap Generator', category: 'MAIN', icon: Compass, desc: 'Step-by-step career path' },
    { id: 'resume', label: 'Resume Analyzer & ATS', category: 'MAIN', icon: FileText, desc: 'Resume scoring & optimization' },
    { id: 'courses', label: 'Courses & Certifications', category: 'MAIN', icon: BookOpen, desc: 'DigiSkills, Google & HEC courses' },

    { id: 'jobs', label: 'Jobs & Internships', category: 'DISCOVER', icon: Briefcase, desc: 'Tech & corporate vacancies' },
    { id: 'universities', label: 'University Matcher', category: 'DISCOVER', icon: Building2, desc: 'HEC recognized universities' },
    { id: 'scholarships', label: 'Scholarship Finder', category: 'DISCOVER', icon: GraduationCap, desc: 'Need & Merit based grants' },
    { id: 'mentorship', label: '1-on-1 Mentor Connect', category: 'DISCOVER', icon: Users, desc: 'Connect with industry experts' },

    { id: 'skillGap', label: 'Skill Gap Analysis', category: 'TOOLS', icon: TrendingUp, desc: 'Identify missing competencies' },
    { id: 'mockInterview', label: 'AI Mock Interview', category: 'TOOLS', icon: Mic, desc: 'Practice voice & tech interviews' },
    { id: 'aiChatbot', label: 'Gemini AI Counselor Chat', category: 'TOOLS', icon: Bot, desc: '24/7 AI career guidance' },
    { id: 'fscMapper', label: 'FSc Stream Mapper', category: 'TOOLS', icon: Award, desc: 'Select board streams & subjects' },
    { id: 'quiz', label: 'RIASEC Interest Quiz', category: 'TOOLS', icon: Sparkles, desc: 'Career psychometric test' },

    { id: 'calendarNotif', label: 'Deadlines & Calendar', category: 'PRODUCTIVITY', icon: Calendar, desc: 'Admissions & test schedules' },
    { id: 'analytics', label: 'Progress Analytics', category: 'REPORTS', icon: BarChart3, desc: 'Skill growth & application stats' },

    { id: 'recruiterPortal', label: 'Recruiter Portal', category: 'PORTALS', icon: Building2, desc: 'Employer hiring suite' },
    { id: 'mentorPortal', label: 'Mentor Portal', category: 'PORTALS', icon: Users, desc: 'Mentor dashboard & sessions' },
    { id: 'adminPanel', label: 'Admin Command Center', category: 'PORTALS', icon: ShieldCheck, desc: 'System management' },

    { id: 'settings', label: 'Settings & Upgrade', category: 'ACCOUNT', icon: Settings, desc: 'Theme & language settings' },
    { id: 'helpCenter', label: 'Help Desk & Support', category: 'ACCOUNT', icon: HelpCircle, desc: 'FAQs & guidance guides' },
    { id: 'landing', label: 'Landing Website', category: 'PUBLIC', icon: Globe, desc: 'Platform landing page' },
    { id: 'designSystem', label: 'Design System Tokens', category: 'PUBLIC', icon: Sliders, desc: 'Apple/Linear design tokens' },
  ];

  const filtered = query.trim() === ''
    ? allItems
    : allItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) || 
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ur' ? 'پورٹل میں کچھ بھی تلاش کریں (مثال: سکالرشپ، یونیورسٹی)...' : 'Type a command or search (e.g., Scholarships, Resume, AI Chat)...'}
              className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">{lang === 'ur' ? 'کوئی نائج نہیں ملا' : 'No matching pages found'}</p>
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/80 dark:hover:bg-blue-950/50 text-left transition-all group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shrink-0 shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {tr(item.label, lang)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                          {tr(item.desc, lang)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang === 'ur' ? 'کی بورڈ شارٹ کٹ: ⌘K یا Ctrl+K' : 'Press ⌘K anytime to open global command search'}</span>
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">NexStep AI</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
