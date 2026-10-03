import { useEffect } from 'react';
import { ArrowRight, LogOut, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MagneticButton } from './MagneticButton';

interface MobileDrawerProps { open: boolean; onClose: () => void; onNavigate: (destination: string) => void; onLogout?: () => void; isAuthenticated?: boolean; links: Array<[string, string]>; lang?: string; }

export function MobileDrawer({ open, onClose, onNavigate, onLogout, isAuthenticated = false, links, lang = 'en' }: MobileDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [onClose, open]);
  const copy = lang === 'ur'
    ? { signIn: 'سائن اِن', start: 'شروع کریں', signOut: 'سائن آؤٹ' }
    : { signIn: 'Sign in', start: 'Get started', signOut: 'Sign out' };
  return <AnimatePresence>{open && <><motion.button aria-label="Close menu overlay" onClick={onClose} className="marketing-drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /><motion.aside aria-label="Mobile navigation" className="marketing-mobile-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 240, damping: 28 }}><button aria-label="Close menu" onClick={onClose} className="marketing-drawer-close"><X className="h-5 w-5" /></button><div className="marketing-drawer-links">{links.map(([label, destination], index) => <motion.button key={label} onClick={() => { onNavigate(destination); onClose(); }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 + index * .06 }}>{label}<ArrowRight className="h-4 w-4" /></motion.button>)}</div><div className="marketing-drawer-actions">{isAuthenticated ? (<button onClick={() => { onLogout?.(); onClose(); }} className="marketing-drawer-signin flex items-center justify-center gap-2"><LogOut className="h-4 w-4" />{copy.signOut}</button>) : (<button onClick={() => { onNavigate('auth'); onClose(); }} className="marketing-drawer-signin">{copy.signIn}</button>)}{!isAuthenticated && <MagneticButton onClick={() => { onNavigate('quiz'); onClose(); }}>{copy.start} <ArrowRight className="h-4 w-4" /></MagneticButton>}</div></motion.aside></>}</AnimatePresence>;
}

export default MobileDrawer;
