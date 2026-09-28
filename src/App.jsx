import React, { lazy, Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar.jsx';
import { CommandPaletteModal } from './components/CommandPaletteModal.jsx';
import { ProfileModal } from './components/ProfileModal.jsx';
import { GuidedTourModal } from './components/tour/GuidedTourModal.jsx';
import { MobileFrameWrapper } from './components/MobileFrameWrapper.jsx';
import { MobileBottomNav } from './components/MobileBottomNav.jsx';
import { MarketingNavbar } from './components/marketing/MarketingNavbar.tsx';
import { MarketingFooter } from './components/marketing/MarketingFooter.tsx';
import { PageLoader } from './components/common/PageLoader.jsx';
import './portal-redesign.css';

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));
const DashboardTab = lazyNamed(() => import('./components/tabs/DashboardTab.jsx'), 'DashboardTab');
const QuizTab = lazyNamed(() => import('./components/tabs/QuizTab.jsx'), 'QuizTab');
const Grade8MatricTab = lazyNamed(() => import('./components/tabs/Grade8MatricTab.jsx'), 'Grade8MatricTab');
const FscMapperTab = lazyNamed(() => import('./components/tabs/FscMapperTab.jsx'), 'FscMapperTab');
const UniversitiesTab = lazyNamed(() => import('./components/tabs/UniversitiesTab.jsx'), 'UniversitiesTab');
const ScholarshipsTab = lazyNamed(() => import('./components/tabs/ScholarshipsTab.jsx'), 'ScholarshipsTab');
const TevtaItTab = lazyNamed(() => import('./components/tabs/TevtaItTab.jsx'), 'TevtaItTab');
const TransnationalTab = lazyNamed(() => import('./components/tabs/TransnationalTab.jsx'), 'TransnationalTab');
const DegreeCareerTab = lazyNamed(() => import('./components/tabs/DegreeCareerTab.jsx'), 'DegreeCareerTab');
const CareerComparisonTab = lazyNamed(() => import('./components/tabs/CareerComparisonTab.jsx'), 'CareerComparisonTab');
const ChatbotTab = lazyNamed(() => import('./components/tabs/ChatbotTab.jsx'), 'ChatbotTab');
const VoiceAssistantTab = lazyNamed(() => import('./components/tabs/VoiceAssistantTab.jsx'), 'VoiceAssistantTab');
const AdminTab = lazyNamed(() => import('./components/tabs/AdminTab.jsx'), 'AdminTab');
const DataReadinessDashboard = lazyNamed(() => import('./components/admin/DataReadinessDashboard.jsx'), 'DataReadinessDashboard');
const LandingTab = lazyNamed(() => import('./components/tabs/LandingTab.jsx'), 'LandingTab');
const DesignSystemTab = lazyNamed(() => import('./components/tabs/DesignSystemTab.jsx'), 'DesignSystemTab');
const AuthTab = lazyNamed(() => import('./components/tabs/AuthTab.jsx'), 'AuthTab');
const OnboardingTab = lazyNamed(() => import('./components/tabs/OnboardingTab.jsx'), 'OnboardingTab');
const CareerAiTab = lazyNamed(() => import('./components/tabs/CareerAiTab.jsx'), 'CareerAiTab');
const ResumeTab = lazyNamed(() => import('./components/tabs/ResumeTab.jsx'), 'ResumeTab');
const SkillGapTab = lazyNamed(() => import('./components/tabs/SkillGapTab.jsx'), 'SkillGapTab');
const CareerRoadmapTab = lazyNamed(() => import('./components/tabs/CareerRoadmapTab.jsx'), 'CareerRoadmapTab');
const CoursesTab = lazyNamed(() => import('./components/tabs/CoursesTab.jsx'), 'CoursesTab');
const JobPortalTab = lazyNamed(() => import('./components/tabs/JobPortalTab.jsx'), 'JobPortalTab');
const MockInterviewTab = lazyNamed(() => import('./components/tabs/MockInterviewTab.jsx'), 'MockInterviewTab');
const CommunityTab = lazyNamed(() => import('./components/tabs/CommunityTab.jsx'), 'CommunityTab');
const MentorshipTab = lazyNamed(() => import('./components/tabs/MentorshipTab.jsx'), 'MentorshipTab');
const CalendarNotifTab = lazyNamed(() => import('./components/tabs/CalendarNotifTab.jsx'), 'CalendarNotifTab');
const AnalyticsTab = lazyNamed(() => import('./components/tabs/AnalyticsTab.jsx'), 'AnalyticsTab');
const SettingsSubTab = lazyNamed(() => import('./components/tabs/SettingsSubTab.jsx'), 'SettingsSubTab');
const HelpCenterTab = lazyNamed(() => import('./components/tabs/HelpCenterTab.jsx'), 'HelpCenterTab');
const RecruiterPortalTab = lazyNamed(() => import('./components/tabs/RecruiterPortalTab.jsx'), 'RecruiterPortalTab');
const MentorPortalTab = lazyNamed(() => import('./components/tabs/MentorPortalTab.jsx'), 'MentorPortalTab');
const PricingTab = lazyNamed(() => import('./components/tabs/PricingTab.jsx'), 'PricingTab');
const EntryTestPrepTab = lazyNamed(() => import('./components/tabs/EntryTestPrepTab.jsx'), 'EntryTestPrepTab');
const MeritCalculatorTab = lazyNamed(() => import('./components/tabs/MeritCalculatorTab.jsx'), 'MeritCalculatorTab');
const ProgressTrackerTab = lazyNamed(() => import('./components/tabs/ProgressTrackerTab.jsx'), 'ProgressTrackerTab');

import { translations } from './data/translations.js';
import { useLanguage } from './context/I18nContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

const TAB_TO_PATH = {
  landing: '/',
  dashboard: '/dashboard',
  auth: '/auth',
  onboarding: '/onboarding',
  quiz: '/quiz',
  grade8Matric: '/grade8-matric',
  fscMapper: '/fsc-mapper',
  universities: '/universities',
  scholarships: '/scholarships',
  jobs: '/jobs',
  tevtaIt: '/tevta-it',
  transnational: '/transnational',
  degreeCareer: '/degree-career',
  careerComparison: '/career-comparison',
  careerAi: '/career-ai',
  resume: '/resume',
  skillGap: '/skill-gap',
  careerRoadmap: '/career-roadmap',
  courses: '/courses',
  mockInterview: '/mock-interview',
  voiceAssistant: '/voice-assistant',
  aiChatbot: '/ai-chatbot',
  community: '/community',
  mentorship: '/mentorship',
  calendarNotif: '/calendar-notif',
  analytics: '/analytics',
  settings: '/settings',
  helpCenter: '/help-center',
  recruiterPortal: '/portal/recruiter',
  mentorPortal: '/portal/mentor',
  adminPanel: '/portal/admin',
  designSystem: '/design-system',
  pricing: '/pricing',
  entryTestPrep: '/entry-test-prep',
  meritCalculator: '/merit-calculator',
  progressTracker: '/progress-tracker',
};

const PATH_TO_TAB = {
  '/': 'landing',
  '/landing': 'landing',
  '/dashboard': 'dashboard',
  '/auth': 'auth',
  '/onboarding': 'onboarding',
  '/quiz': 'quiz',
  '/grade8-matric': 'grade8Matric',
  '/fsc-mapper': 'fscMapper',
  '/universities': 'universities',
  '/scholarships': 'scholarships',
  '/jobs': 'jobs',
  '/job-portal': 'jobs',
  '/tevta-it': 'tevtaIt',
  '/transnational': 'transnational',
  '/degree-career': 'degreeCareer',
  '/career-comparison': 'careerComparison',
  '/career-ai': 'careerAi',
  '/resume': 'resume',
  '/skill-gap': 'skillGap',
  '/career-roadmap': 'careerRoadmap',
  '/courses': 'courses',
  '/mock-interview': 'mockInterview',
  '/voice-assistant': 'voiceAssistant',
  '/ai-chatbot': 'aiChatbot',
  '/community': 'community',
  '/mentorship': 'mentorship',
  '/calendar-notif': 'calendarNotif',
  '/analytics': 'analytics',
  '/settings': 'settings',
  '/help-center': 'helpCenter',
  '/portal/recruiter': 'recruiterPortal',
  '/recruiter-portal': 'recruiterPortal',
  '/portal/mentor': 'mentorPortal',
  '/mentor-portal': 'mentorPortal',
  '/portal/admin': 'adminPanel',
  '/admin-panel': 'adminPanel',
  '/design-system': 'designSystem',
  '/pricing': 'pricing',
  '/entry-test-prep': 'entryTestPrep',
  '/merit-calculator': 'meritCalculator',
  '/progress-tracker': 'progressTracker',
};

export default function App() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { user, authStatus, logout, refreshUser } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = PATH_TO_TAB[location.pathname] || 'dashboard';

  const handleSelectTab = (tabOrFn) => {
    let nextTab;
    if (typeof tabOrFn === 'function') {
      nextTab = tabOrFn(activeTab);
    } else {
      nextTab = tabOrFn;
    }
    const targetPath = TAB_TO_PATH[nextTab] || `/${nextTab}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const [isMobileView, setIsMobileView] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState(false);

  // Auto-prompt Guided Tour for first-time visitors
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem('nexstep_guided_tour_completed');
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsGuidedTourOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexstep_lang', lang);
    } catch (e) { }
  }, [lang]);

  // ── Profile state — PostgreSQL is the authoritative source once authenticated ──
  // The default below is only used before the first fetch resolves or for
  // unauthenticated public pages. After login it is replaced with real DB data.
  const [profile, setProfile] = useState({
    name: '',
    gradeLevel: '',
    city: '',
    province: '',
    familyMonthlyIncomePkr: 0,
    budgetAnnualPkr: 0,
    preferredStream: '',
    topRiasecCluster: '',
    marks: { matricPct: 0, fscPct: 0, entryTestScore: 0 },
    skills: [],
    certifications: [],
    targetCareer: '',
    goals: '',
  });

  // ── Profile completion helper ─────────────────────────────────────────────
  // Returns true when the user has enough data to skip onboarding.
  const isProfileComplete = (p) => {
    const hasName = !!(p?.name?.trim());
    const hasStream = !!(p?.preferredStream);
    const hasSkills = Array.isArray(p?.skills) && p.skills.length > 0;
    const hasMarks = !!(p?.marks?.matricPct || p?.marks?.fscPct);
    return hasName && hasStream && (hasSkills || hasMarks);
  };

  // ── Load full profile from PostgreSQL when auth status changes ────────────
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/profile', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(resData => {
          if (resData?.data) {
            setProfile(resData.data);
            // Route newly registered users (incomplete profiles) to onboarding
            // but only if they are currently on the dashboard or root path
            const currentPath = window.location.hash.replace('#', '') || '/';
            const onPublicPage = ['/', '/auth', '/landing'].some(p => currentPath === p || currentPath.startsWith(p + '?'));
            if (!isProfileComplete(resData.data) && !onPublicPage && currentPath !== '/onboarding') {
              navigate('/onboarding');
            }
          }
        })
        .catch(err => console.log('Profile fetch note:', err));
    } else if (authStatus === 'unauthenticated') {
      // Clear profile when logged out so no stale data bleeds between users
      setProfile({ name: '', gradeLevel: '', city: '', province: '', familyMonthlyIncomePkr: 0, budgetAnnualPkr: 0, preferredStream: '', topRiasecCluster: '', marks: { matricPct: 0, fscPct: 0, entryTestScore: 0 }, skills: [], certifications: [], targetCareer: '', goals: '' });
    }
  }, [authStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateProfile = (updatedFields) => {
    const nextProfile = { ...profile, ...updatedFields };
    setProfile(nextProfile);
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(nextProfile),
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        // If the server merged additional fields, keep them
        if (data?.data) setProfile(prev => ({ ...prev, ...data.data }));
        // Sync name change into auth context (Navbar display)
        if (updatedFields.name) refreshUser?.();
      })
      .catch(err => console.error('Error persisting profile:', err));
  };

  const content = (
    <div
      className={`nexstep-app ${activeTab === 'landing' ? 'marketing-app' : 'product-app'} min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'dark' : ''} bg-mesh-pattern selection:bg-emerald-600 selection:text-white relative overflow-hidden ${lang === 'ur' ? 'font-urdu' : ''}`}
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      lang={lang}
    >
      {/* Global Soft Academic Accent Glows */}
      <div className={`fixed top-0 left-1/4 -mt-24 w-[500px] h-[500px] ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-500/5'} rounded-full blur-[140px] pointer-events-none z-0`} />
      <div className={`fixed bottom-0 right-1/4 -mb-24 w-[500px] h-[500px] ${isDark ? 'bg-teal-600/10' : 'bg-teal-500/5'} rounded-full blur-[140px] pointer-events-none z-0`} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <MarketingNavbar activeTab={activeTab} onNavigate={handleSelectTab} lang={lang} />

        {/* Layout Container with Collapsible Sidebar */}
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative pt-16">
          {activeTab !== 'landing' && activeTab !== 'auth' && (
            <div className="hidden md:block">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={handleSelectTab}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                lang={lang}
                profile={profile}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onLogout={() => { logout(); handleSelectTab('landing'); }}
              />
            </div>
          )}

          <main id="main-content" className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                className={`portal-route-shell portal-route-${activeTab} ${activeTab === 'landing' ? 'portal-route-marketing' : 'portal-route-product'}`}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <Suspense fallback={<PageLoader />}>
                  <Routes location={location}>
                  <Route path="/" element={<LandingTab onNavigate={handleSelectTab} lang={lang} />} />
                  <Route path="/landing" element={<Navigate to="/" replace />} />
                  <Route path="/auth" element={<AuthTab onAuthenticated={() => handleSelectTab('dashboard')} onNavigate={handleSelectTab} lang={lang} />} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardTab profile={profile} onNavigate={handleSelectTab} lang={lang} /></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><OnboardingTab profile={profile} onUpdateProfile={handleUpdateProfile} onNavigate={handleSelectTab} lang={lang} /></ProtectedRoute>} />
                  <Route path="/quiz" element={<ProtectedRoute><QuizTab profile={profile} onUpdateProfile={handleUpdateProfile} onNavigate={handleSelectTab} lang={lang} /></ProtectedRoute>} />
                  <Route path="/career-ai" element={<ProtectedRoute><CareerAiTab profile={profile} onNavigate={handleSelectTab} lang={lang} /></ProtectedRoute>} />
                  <Route path="/skill-gap" element={<ProtectedRoute><SkillGapTab profile={profile} onNavigate={handleSelectTab} lang={lang} /></ProtectedRoute>} />
                  <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmapTab profile={profile} onNavigate={handleSelectTab} lang={lang} /></ProtectedRoute>} />
                  <Route path="/resume" element={<ProtectedRoute><ResumeTab profile={profile} lang={lang} /></ProtectedRoute>} />
                  <Route path="/mock-interview" element={<ProtectedRoute><MockInterviewTab profile={profile} lang={lang} /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><AnalyticsTab profile={profile} lang={lang} onNavigate={handleSelectTab} /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsSubTab profile={profile} onUpdateProfile={handleUpdateProfile} lang={lang} setLang={setLang} onNavigate={handleSelectTab} /></ProtectedRoute>} />
                  <Route path="/portal/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminTab lang={lang} /></ProtectedRoute>} />
                  <Route path="/admin/data-readiness" element={<ProtectedRoute roles={['ADMIN']}><DataReadinessDashboard lang={lang} /></ProtectedRoute>} />
                  <Route path="/admin-panel" element={<Navigate to="/portal/admin" replace />} />
                  <Route path="/grade8-matric" element={<Grade8MatricTab profile={profile} onNavigate={handleSelectTab} lang={lang} />} />
                  <Route path="/fsc-mapper" element={<FscMapperTab profile={profile} onNavigate={handleSelectTab} lang={lang} />} />
                  <Route path="/universities" element={<UniversitiesTab profile={profile} lang={lang} />} />
                  <Route path="/scholarships" element={<ScholarshipsTab profile={profile} lang={lang} />} />
                  <Route path="/jobs" element={<JobPortalTab profile={profile} lang={lang} />} />
                  <Route path="/job-portal" element={<Navigate to="/jobs" replace />} />
                  <Route path="/tevta-it" element={<TevtaItTab lang={lang} />} />
                  <Route path="/transnational" element={<TransnationalTab lang={lang} />} />
                  <Route path="/degree-career" element={<DegreeCareerTab lang={lang} />} />
                  <Route path="/career-comparison" element={<CareerComparisonTab lang={lang} />} />
                  <Route path="/courses" element={<CoursesTab lang={lang} />} />
                  <Route path="/voice-assistant" element={<VoiceAssistantTab profile={profile} lang={lang} />} />
                  <Route path="/ai-chatbot" element={<ProtectedRoute><ChatbotTab profile={profile} lang={lang} /></ProtectedRoute>} />
                  <Route path="/community" element={<CommunityTab profile={profile} lang={lang} />} />
                  <Route path="/mentorship" element={<MentorshipTab profile={profile} lang={lang} />} />
                  <Route path="/calendar-notif" element={<ProtectedRoute><CalendarNotifTab lang={lang} /></ProtectedRoute>} />
                  <Route path="/help-center" element={<HelpCenterTab lang={lang} onNavigate={handleSelectTab} />} />
                  <Route path="/portal/recruiter" element={<RecruiterPortalTab lang={lang} />} />
                  <Route path="/recruiter-portal" element={<Navigate to="/portal/recruiter" replace />} />
                  <Route path="/portal/mentor" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><MentorPortalTab lang={lang} /></ProtectedRoute>} />
                  <Route path="/mentor-portal" element={<Navigate to="/portal/mentor" replace />} />
                  <Route path="/design-system" element={<DesignSystemTab lang={lang} />} />
                  <Route path="/pricing" element={<PricingTab profile={profile} onUpdateProfile={handleUpdateProfile} onNavigate={handleSelectTab} lang={lang} />} />
                  <Route path="/entry-test-prep"  element={<EntryTestPrepTab  profile={profile} lang={lang} />} />
                  <Route path="/merit-calculator" element={<MeritCalculatorTab profile={profile} lang={lang} />} />
                  <Route path="/progress-tracker" element={<ProgressTrackerTab profile={profile} lang={lang} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <MarketingFooter onNavigate={handleSelectTab} lang={lang} />

        {/* Profile Edit Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onSaveProfile={handleUpdateProfile}
          lang={lang}
        />

        {/* Global Command Palette (⌘K) Modal */}
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectTab={handleSelectTab}
          lang={lang}
        />

        {/* Guided Tour Modal */}
        <GuidedTourModal
          isOpen={isGuidedTourOpen}
          onClose={() => setIsGuidedTourOpen(false)}
          onNavigateTab={handleSelectTab}
          lang={lang}
        />

        {/* Premium Mobile Bottom Navigation Dock */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isMobileView={isMobileView}
        />
      </div>
    </div>
  );

  if (isMobileView) {
    return (
      <MobileFrameWrapper onClose={() => setIsMobileView(false)}>
        {content}
      </MobileFrameWrapper>
    );
  }

  return content;
}
