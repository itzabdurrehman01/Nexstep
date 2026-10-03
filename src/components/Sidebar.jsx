import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
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
  UserCheck, 
  Globe, 
  BookOpen, 
  Award, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  Pin,
  Search,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Map,
  Volume2,
  LogOut
} from 'lucide-react';
import { tr } from '../utils/translator.js';
import { getUserRole, useAuth } from '../context/AuthContext.jsx';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  lang = 'en', 
  profile,
  onOpenCommandPalette,
  onLogout,
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [pinnedTabs, setPinnedTabs] = useState(['dashboard', 'careerAi', 'jobs']);

  const { user } = useAuth();
  const role = getUserRole(user);
  const roleLabel = role === 'ADMIN' ? 'Administrator' : role === 'MENTOR' ? 'Mentor' : role === 'RECRUITER' ? 'Recruiter' : 'Student';
  const accountName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || roleLabel : profile?.name || 'Student';
  const accountSubtitle = user?.email || (role === 'STUDENT' ? tr(profile?.gradeLevel || 'FSc / Inter', lang) : roleLabel);

  useEffect(() => {
    const defaults = role === 'ADMIN'
      ? ['adminPanel', 'mentorPortal', 'analytics']
      : role === 'MENTOR'
      ? ['mentorPortal', 'calendarNotif', 'analytics']
      : role === 'RECRUITER'
      ? ['recruiterPortal', 'jobs', 'analytics']
      : ['dashboard', 'careerAi', 'jobs'];
    setPinnedTabs(defaults);
  }, [role]);

  const togglePin = (e, tabId) => {
    e.stopPropagation();
    setPinnedTabs(prev => 
      prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
    );
  };

  // ── Role-aware navigation ─────────────────────────────────────────────────
  const STUDENT_GROUPS = [
    {
      title: 'MAIN', titleUrdu: 'مرکزی',
      items: [
        { id: 'dashboard',       label: 'Dashboard',          icon: Compass,    badge: 'AI' },
        { id: 'careerAi',        label: 'Career AI',          icon: Sparkles,   highlight: true },
        { id: 'careerRoadmap',   label: 'Career Roadmap',     icon: Map },
        { id: 'skillGap',        label: 'Skill Gap',          icon: TrendingUp },
        { id: 'resume',          label: 'Resume ATS',         icon: FileText,   badge: '88%' },
      ]
    },
    {
      title: 'EXPLORE', titleUrdu: 'دریافت کریں',
      items: [
        { id: 'jobs',              label: 'Jobs',               icon: Briefcase,       badge: 'New' },
        { id: 'universities',      label: 'Universities',       icon: Building2 },
        { id: 'scholarships',      label: 'Scholarships',       icon: GraduationCap },
        { id: 'courses',           label: 'Courses',            icon: BookOpen },
        { id: 'tevtaIt',           label: 'TEVTA',              icon: Wrench },
        { id: 'careerComparison',  label: 'Career Comparison',  icon: ArrowRightLeft,  badge: 'Charts' },
      ]
    },
    {
      title: 'PRACTICE', titleUrdu: 'مشق کریں',
      items: [
        { id: 'mockInterview',   label: 'Mock Interview',   icon: Mic },
        { id: 'aiChatbot',       label: 'AI Counselor',     icon: Bot },
        { id: 'voiceAssistant',  label: 'Voice Assistant',  icon: Volume2,  badge: 'Voice', highlight: true },
      ]
    },
    {
      title: 'TRACK', titleUrdu: 'ٹریک کریں',
      items: [
        { id: 'analytics',      label: 'Analytics',           icon: BarChart3 },
        { id: 'calendarNotif',  label: 'Calendar',            icon: Calendar },
        { id: 'community',      label: 'Applications/Community', icon: Users },
      ]
    },
    {
      title: 'PORTALS', titleUrdu: 'پورٹلز',
      items: [
        { id: 'mentorPortal',    label: 'Mentor Portal',    icon: Users },
        { id: 'recruiterPortal', label: 'Recruiter Portal', icon: Building2 },
        { id: 'mentorship',      label: 'Mentorship',       icon: Users },
        { id: 'adminPanel',      label: 'Admin',            icon: ShieldCheck, badge: 'Admin', highlight: true },
      ]
    },
    {
      title: 'ACCOUNT', titleUrdu: 'اکاؤنٹ',
      items: [
        { id: 'onboarding',  label: 'Profile / Onboarding', icon: UserCheck },
        { id: 'settings',    label: 'Settings',             icon: Settings },
        { id: 'helpCenter',  label: 'Help Center',          icon: HelpCircle },
        { id: 'landing',     label: 'Landing Page',         icon: Globe },
        { id: 'pricing',     label: 'Upgrade to Pro',       icon: Zap,       highlight: true, badge: 'PRO' },
      ]
    },
  ];

  const ADMIN_GROUPS = [
    {
      title: 'ADMIN', titleUrdu: 'ایڈمن',
      items: [
        { id: 'adminPanel',  label: 'Admin Dashboard',   icon: ShieldCheck, badge: 'Admin', highlight: true },
        { id: 'mentorPortal',label: 'Mentor Workspace',  icon: Users,       badge: 'Mentor' },
        { id: 'dashboard',   label: 'Platform Overview', icon: Compass },
        { id: 'analytics',   label: 'Platform Analytics',icon: BarChart3 },
      ]
    },
    {
      title: 'MANAGEMENT', titleUrdu: 'انتظام',
      items: [
        { id: 'universities',label: 'Universities',      icon: Building2 },
        { id: 'scholarships',label: 'Scholarships',      icon: GraduationCap },
        { id: 'jobs',        label: 'Jobs',              icon: Briefcase },
        { id: 'courses',     label: 'Courses',           icon: BookOpen },
        { id: 'community',   label: 'Community',         icon: Users },
      ]
    },
    {
      title: 'ACCOUNT', titleUrdu: 'اکاؤنٹ',
      items: [
        { id: 'settings',    label: 'Settings',          icon: Settings },
        { id: 'helpCenter',  label: 'Help Desk',         icon: HelpCircle },
      ]
    },
  ];

  const MENTOR_GROUPS = [
    {
      title: 'MENTOR', titleUrdu: 'منٹر',
      items: [
        { id: 'mentorPortal', label: 'Mentor Dashboard', icon: Users, highlight: true },
        { id: 'mentorship',   label: 'Student Sessions', icon: Users },
        { id: 'calendarNotif',label: 'Calendar',         icon: Calendar },
        { id: 'community',    label: 'Community',        icon: Users },
        { id: 'analytics',    label: 'Analytics',        icon: BarChart3 },
      ]
    },
    {
      title: 'ACCOUNT', titleUrdu: 'اکاؤنٹ',
      items: [
        { id: 'settings',     label: 'Settings',         icon: Settings },
        { id: 'helpCenter',   label: 'Help Desk',        icon: HelpCircle },
      ]
    },
  ];

  const RECRUITER_GROUPS = [
    {
      title: 'RECRUITER', titleUrdu: 'ریکروٹر',
      items: [
        { id: 'recruiterPortal', label: 'Recruiter Dashboard', icon: Building2, highlight: true },
        { id: 'analytics',       label: 'Analytics',           icon: BarChart3 },
      ]
    },
    {
      title: 'ACCOUNT', titleUrdu: 'اکاؤنٹ',
      items: [
        { id: 'settings',  label: 'Settings',  icon: Settings },
        { id: 'helpCenter',label: 'Help Desk', icon: HelpCircle },
      ]
    },
  ];

  const navGroups =
    role === 'ADMIN'     ? ADMIN_GROUPS     :
    role === 'MENTOR'    ? MENTOR_GROUPS    :
    role === 'RECRUITER' ? RECRUITER_GROUPS :
    STUDENT_GROUPS;

  return (
    <aside 
      className={`nexstep-sidebar relative z-30 transition-all duration-300 ease-in-out shrink-0 bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-blue-600 text-white border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? (
          lang === 'ur' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          lang === 'ur' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Quick Search & Command Trigger Bar */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              <span>{lang === 'ur' ? 'تلاش کریں...' : 'Search portal...'}</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
        {/* Pinned Quick Access Section */}
        {pinnedTabs.length > 0 && !isCollapsed && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-between">
              <span>{lang === 'ur' ? 'پن کی ہوئی شے' : 'Favorites'}</span>
              <Pin className="w-3 h-3" />
            </div>
            <div className="grid grid-cols-1 gap-1">
              {pinnedTabs.map(tabId => {
                const groupItem = navGroups.flatMap(g => g.items).find(i => i.id === tabId);
                if (!groupItem) return null;
                const Icon = groupItem.icon;
                const isActive = activeTab === tabId;

                return (
                  <div
                    key={`pinned-${tabId}`}
                    onClick={() => setActiveTab(tabId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveTab(tabId)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tr(groupItem.label, lang)}</span>
                    </span>
                    <span 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); togglePin(e, tabId); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); togglePin(e, tabId); } }}
                      className="p-1 hover:bg-white/20 rounded cursor-pointer"
                    >
                      <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {lang === 'ur' ? group.titleUrdu : group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isPinned = pinnedTabs.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveTab(item.id)}
                    title={isCollapsed ? tr(item.label, lang) : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-black'
                        : item.highlight
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-200/80 dark:border-emerald-800/80'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`} />
                      {!isCollapsed && (
                        <span className="truncate">{tr(item.label, lang)}</span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1 shrink-0">
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); togglePin(e, item.id); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); togglePin(e, item.id); } }}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer ${
                            isPinned ? 'opacity-100 text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Quick Status Profile Card at Bottom */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {accountName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-black text-slate-900 dark:text-white truncate">
                {accountName}
              </span>
              <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">
                {accountSubtitle}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center text-emerald-500" title="Profile Verified">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title={lang === 'ur' ? 'سائن آؤٹ' : 'Sign out'}
                  aria-label="Sign out"
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Collapsed logout icon */}
      {isCollapsed && onLogout && (
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={onLogout}
            title={lang === 'ur' ? 'سائن آؤٹ' : 'Sign out'}
            aria-label="Sign out"
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
