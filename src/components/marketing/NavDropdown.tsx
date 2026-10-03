import { type ComponentType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export interface DropdownItem { label: string; description: string; icon: ComponentType<{ className?: string }>; destination: string; }
interface NavDropdownProps { open: boolean; items: DropdownItem[]; onNavigate: (destination: string) => void; onMouseEnter: () => void; onMouseLeave: () => void; }

export function NavDropdown({ open, items, onNavigate, onMouseEnter, onMouseLeave }: NavDropdownProps) {
  return <AnimatePresence>{open && <motion.div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} initial={{ opacity: 0, y: -8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }} transition={{ duration: .18, ease: [0.16, 1, .3, 1] }} className="marketing-nav-dropdown">{items.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => onNavigate(item.destination)} className="marketing-dropdown-item"><span className="marketing-dropdown-icon"><Icon className="h-4 w-4" /></span><span><b>{item.label}</b><small>{item.description}</small></span><ArrowUpRight className="marketing-dropdown-arrow h-3.5 w-3.5" /></button>; })}</motion.div>}</AnimatePresence>;
}

export default NavDropdown;
