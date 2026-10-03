import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Building2, ChevronDown, FileText, LogOut, Menu, Sparkles, Target, WandSparkles } from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../../assets/images/nexstep_logo_1786045525796.png';
import { cn } from '../../utils/cn';
import { getUserRole, useAuth } from '../../context/AuthContext.jsx';
import { MagneticButton } from './MagneticButton';
import { MobileDrawer } from './MobileDrawer';
import { DropdownItem, NavDropdown } from './NavDropdown';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher from '../common/ThemeSwitcher.jsx';
import { NotificationBell } from '../notifications/NotificationBell.jsx';

interface MarketingNavbarProps { onNavigate: (destination: string) => void; activeTab: string; lang?: string; }
interface NavLink { label: string; destination?: string; dropdown?: DropdownItem[]; }
const OPEN_DELAY = 80;
const CLOSE_DELAY = 120;
const landingExplore: DropdownItem[] = [
  { label: 'Career Intelligence', description: 'AI-guided paths built around you', icon: Sparkles, destination: 'careerAi' },
  { label: 'University Explorer', description: 'Compare 100+ recognised institutions', icon: Building2, destination: 'universities' },
  { label: 'Opportunity Finder', description: 'Scholarships, jobs, and practical skills', icon: BriefcaseBusiness, destination: 'scholarships' },
];
const portalNav: NavLink[] = [
  { label: 'Dashboard', destination: 'dashboard' },
  { label: 'Career', dropdown: [{ label: 'Career AI', description: 'Personalised recommendations', icon: Sparkles, destination: 'careerAi' }, { label: 'Roadmap', description: 'Your next best milestones', icon: Target, destination: 'careerRoadmap' }, { label: 'Skill Gap', description: 'Skills to build next', icon: BarChart3, destination: 'skillGap' }] },
  { label: 'Explore', dropdown: [{ label: 'Universities', description: 'Admissions and comparisons', icon: Building2, destination: 'universities' }, { label: 'Scholarships', description: 'Funding opportunities', icon: BookOpen, destination: 'scholarships' }, { label: 'Jobs & Internships', description: 'Real market opportunities', icon: BriefcaseBusiness, destination: 'jobs' }] },
  { label: 'AI Tools', dropdown: [{ label: 'Resume Intelligence', description: 'Make your resume stronger', icon: FileText, destination: 'resume' }, { label: 'Mock Interview', description: 'Practice with AI', icon: WandSparkles, destination: 'mockInterview' }, { label: 'AI Counselor', description: 'Ask anything, anytime', icon: Sparkles, destination: 'aiChatbot' }] },
];
const mentorNav: NavLink[] = [
  { label: 'Mentor Hub', destination: 'mentorPortal' },
  { label: 'Students', destination: 'mentorship' },
  { label: 'Sessions', destination: 'calendarNotif' },
  { label: 'Insights', destination: 'analytics' },
];
const adminNav: NavLink[] = [
  { label: 'Admin', destination: 'adminPanel' },
  { label: 'Mentor View', destination: 'mentorPortal' },
  { label: 'Operations', dropdown: [{ label: 'Universities', description: 'Manage institution data', icon: Building2, destination: 'universities' }, { label: 'Scholarships', description: 'Manage funding opportunities', icon: BookOpen, destination: 'scholarships' }, { label: 'Jobs & Internships', description: 'Manage market opportunities', icon: BriefcaseBusiness, destination: 'jobs' }] },
  { label: 'Analytics', destination: 'analytics' },
];

const URDU: Record<string, string> = {
  'Career Intelligence': 'کیریئر انٹیلیجنس', 'AI-guided paths built around you': 'آپ کے لیے تیار کردہ اے آئی رہنمائی',
  'University Explorer': 'یونیورسٹی ایکسپلورر', 'Compare 100+ recognised institutions': '100 سے زائد تسلیم شدہ اداروں کا موازنہ کریں',
  'Opportunity Finder': 'مواقع تلاش کریں', 'Scholarships, jobs, and practical skills': 'اسکالرشپس، نوکریاں اور عملی مہارتیں',
  Dashboard: 'ڈیش بورڈ', Career: 'کیریئر', Explore: 'دریافت کریں', 'AI Tools': 'اے آئی ٹولز',
  'Career AI': 'کیریئر اے آئی', 'Personalised recommendations': 'آپ کے لیے ذاتی سفارشات', Roadmap: 'روڈ میپ',
  'Your next best milestones': 'آپ کے اگلے اہم مراحل', 'Skill Gap': 'مہارتوں کا فرق', 'Skills to build next': 'اگلی سیکھنے والی مہارتیں',
  Universities: 'یونیورسٹیاں', 'Admissions and comparisons': 'داخلے اور موازنہ', Scholarships: 'اسکالرشپس',
  'Funding opportunities': 'فنڈنگ کے مواقع', 'Jobs & Internships': 'نوکریاں اور انٹرن شپس', 'Real market opportunities': 'حقیقی مارکیٹ مواقع',
  'Resume Intelligence': 'ریزیومے انٹیلیجنس', 'Make your resume stronger': 'اپنا ریزیومے بہتر بنائیں',
  'Mock Interview': 'پریکٹس انٹرویو', 'Practice with AI': 'اے آئی کے ساتھ مشق کریں', 'AI Counselor': 'اے آئی مشیر', 'Ask anything, anytime': 'کچھ بھی، کسی بھی وقت پوچھیں',
  'Mentor Hub': 'مینٹور ہب', Students: 'طلبہ', Sessions: 'سیشنز', Insights: 'بصیرتیں', Admin: 'ایڈمن',
  'Mentor View': 'مینٹور ویو', Operations: 'انتظام', Analytics: 'تجزیات',
  'Manage institution data': 'اداروں کا ڈیٹا منظم کریں', 'Manage funding opportunities': 'فنڈنگ مواقع منظم کریں', 'Manage market opportunities': 'مارکیٹ مواقع منظم کریں',
  Features: 'خصوصیات', Pathways: 'راستے', Pricing: 'قیمتیں', About: 'ہمارے بارے میں', Resources: 'وسائل', Settings: 'ترتیبات',
  'Admin Dashboard': 'ایڈمن ڈیش بورڈ', 'Mentor Workspace': 'مینٹور ورک اسپیس', 'Mentor Dashboard': 'مینٹور ڈیش بورڈ',
  'Student workspace': 'طالب علم ورک اسپیس', 'Mentor workspace': 'مینٹور ورک اسپیس', 'Admin workspace': 'ایڈمن ورک اسپیس',
  'Sign in': 'سائن اِن', 'Get started': 'شروع کریں', 'Ask NexStep': 'نیکسٹ اسٹیپ سے پوچھیں', 'Admin Console': 'ایڈمن کنسول',
};
const localize = (value: string, lang: string) => lang === 'ur' ? (URDU[value] || value) : value;
const localizeLinks = (items: NavLink[], lang: string): NavLink[] => items.map((item) => ({
  ...item,
  label: localize(item.label, lang),
  dropdown: item.dropdown?.map((entry) => ({ ...entry, label: localize(entry.label, lang), description: localize(entry.description, lang) })),
}));

export function MarketingNavbar({ onNavigate, activeTab, lang = 'en' }: MarketingNavbarProps) {
  const landing = activeTab === 'landing';
  const { user } = useAuth();
  const role = getUserRole(user);
  const [scrolled, setScrolled] = useState(!landing);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const lastY = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const links = useMemo<NavLink[]>(() => {
    const source = landing ? [{ label: 'Explore', dropdown: landingExplore }, { label: 'Pricing', destination: 'pricing' }, { label: 'Resources', destination: 'helpCenter' }, { label: 'About', destination: 'onboarding' }] : role === 'ADMIN' ? adminNav : role === 'MENTOR' ? mentorNav : portalNav;
    return localizeLinks(source, lang);
  }, [landing, role, lang]);
  const mobileLinks = useMemo<Array<[string, string]>>(() => {
    const source: Array<[string, string]> = landing ? [['Features', 'careerAi'], ['Pathways', 'universities'], ['Pricing', 'pricing'], ['About', 'helpCenter']] : role === 'ADMIN' ? [['Admin Dashboard', 'adminPanel'], ['Mentor Workspace', 'mentorPortal'], ['Operations', 'universities'], ['Analytics', 'analytics'], ['Settings', 'settings']] : role === 'MENTOR' ? [['Mentor Dashboard', 'mentorPortal'], ['Students', 'mentorship'], ['Sessions', 'calendarNotif'], ['Insights', 'analytics'], ['Settings', 'settings']] : [['Dashboard', 'dashboard'], ['Career AI', 'careerAi'], ['Explore', 'universities'], ['AI Tools', 'aiChatbot'], ['Settings', 'settings']];
    return source.map(([label, destination]) => [localize(label, lang), destination]);
  }, [landing, role, lang]);

  useEffect(() => { const onScroll = () => { const y = window.scrollY; setScrolled(!landing || y > 60); setHidden(y > 150 && y > lastY.current); lastY.current = y; }; onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, [landing]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const scheduleOpen = (label: string) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpenDropdown(label), OPEN_DELAY); };
  const scheduleClose = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpenDropdown(null), CLOSE_DELAY); };

  const { logout } = useAuth();
  const workspaceLabel = localize(role === 'ADMIN' ? 'Admin workspace' : role === 'MENTOR' ? 'Mentor workspace' : 'Student workspace', lang);
  const quickAction = role === 'ADMIN' ? 'adminPanel' : role === 'MENTOR' ? 'mentorPortal' : 'careerAi';
  const quickActionLabel = localize(role === 'ADMIN' ? 'Admin Console' : role === 'MENTOR' ? 'Mentor Hub' : 'Ask NexStep', lang);
  const isAuthScreen = activeTab === 'auth' || activeTab === 'login';
  const showSignOut = Boolean(user && !isAuthScreen && !landing);
  const handleLogout = () => { logout(); onNavigate('landing'); };
  return <><motion.header className={cn('marketing-navbar', !landing && 'marketing-navbar-portal', scrolled && 'is-scrolled', hidden && 'is-hidden')} animate={{ y: hidden ? '-100%' : 0 }} transition={{ duration: hidden ? .28 : .2, ease: [0.4, 0, .2, 1] }}><div className="marketing-navbar-inner"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} onClick={() => onNavigate('landing')} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0 text-left"><span className="nexstep-logo-wrap"><img src={logoImg} alt="NexStep.AI" /></span><span className="hidden sm:inline-flex flex-col border-l border-white/20 pl-3 py-0.5 ml-0.5 leading-none"><span className="text-[11px] font-bold tracking-tight text-slate-100">{localize('NexStep', lang)}</span><span className="text-[9.5px] font-medium text-emerald-400 mt-1 tracking-wide">{landing ? localize('Your Next Step, Guided by AI', lang) : workspaceLabel}</span></span></motion.button><nav role="navigation" aria-label="Primary navigation" className="marketing-nav-links">{links.map((link) => link.dropdown ? <div key={link.label} onMouseEnter={() => scheduleOpen(link.label)} onMouseLeave={scheduleClose} className="marketing-nav-dropdown-wrap"><button aria-current={openDropdown === link.label ? 'page' : undefined} onClick={() => setOpenDropdown((open) => open === link.label ? null : link.label)}>{link.label}<ChevronDown className="h-3.5 w-3.5" /></button><NavDropdown open={openDropdown === link.label} items={link.dropdown} onNavigate={(destination) => { setOpenDropdown(null); onNavigate(destination); }} onMouseEnter={() => scheduleOpen(link.label)} onMouseLeave={scheduleClose} /></div> : <button key={link.label} aria-current={activeTab === link.destination ? 'page' : undefined} onClick={() => onNavigate(link.destination || 'dashboard')}>{link.label}</button>)}</nav><div className="marketing-nav-actions">{Boolean(user) && <NotificationBell onNavigate={onNavigate} />}<LanguageSwitcher /><ThemeSwitcher />{showSignOut ? (<button onClick={handleLogout} aria-label="Sign out" title="Sign out" className="marketing-signin flex items-center gap-1.5 cursor-pointer"><LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">{lang === 'ur' ? 'سائن آؤٹ' : 'Sign out'}</span></button>) : isAuthScreen ? null : (<button onClick={() => onNavigate(landing ? 'auth' : (user ? 'dashboard' : 'auth'))} className="marketing-signin cursor-pointer">{landing ? localize('Sign in', lang) : (user ? localize('Dashboard', lang) : localize('Sign in', lang))}</button>)}<MagneticButton onClick={() => onNavigate(landing ? 'quiz' : quickAction)} className="marketing-nav-cta">{landing ? localize('Get started', lang) : quickActionLabel} <ArrowRight className="h-3.5 w-3.5" /></MagneticButton><button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="marketing-menu-button"><Menu className="h-5 w-5" /></button></div></div></motion.header><MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} onLogout={handleLogout} isAuthenticated={showSignOut} links={mobileLinks} lang={lang} /></>;
}

export default MarketingNavbar;
