import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MagneticButton } from './MagneticButton';
import { useMousePosition } from '../../hooks/useMousePosition';

const HeroScene = lazy(() => import('./HeroScene'));

interface MarketingHeroProps { onNavigate: (tab: string) => void; }

const headingWords = ['The', 'career', 'move', 'that', 'changes', 'everything.'];

export function MarketingHero({ onNavigate }: MarketingHeroProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const mouse = useMousePosition();

  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="marketing-hero">
      <motion.div className="marketing-spotlight" aria-hidden="true" animate={reduceMotion ? undefined : { x: mouse.x - 170, y: mouse.y - 170 }} transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.45 }} />
      <div className="marketing-hero-grid" aria-hidden="true" />
      <div className="marketing-scene" aria-hidden="true">
        {mounted && !reduceMotion && <Suspense fallback={<div className="marketing-scene-fallback" />}><HeroScene /></Suspense>}
      </div>
      <motion.div className="marketing-orb marketing-orb-violet" animate={reduceMotion ? undefined : { y: [0, -20, 0], x: [0, 12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="marketing-orb marketing-orb-emerald" animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="marketing-hero-content">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="marketing-kicker">
          <Sparkles className="h-3.5 w-3.5" /> Career intelligence, reimagined
        </motion.div>
        <h1 className="marketing-display">
          {headingWords.map((word, index) => (
            <motion.span key={word} className={index > 1 ? 'marketing-gradient-text' : ''} initial={{ opacity: 0, y: 44, rotateX: -70 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.76, delay: 0.18 + index * 0.075, ease: [0.16, 1, 0.3, 1] }}>
              {word}{' '}
            </motion.span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.72 }} className="marketing-lede">
          NexStep turns your interests, academic profile, and ambitions into a confident plan for university, skills, and the career ahead.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.86 }} className="marketing-hero-actions">
          <MagneticButton onClick={() => onNavigate('quiz')}><span>Build my pathway</span><ArrowRight className="h-4 w-4" /></MagneticButton>
          <MagneticButton variant="secondary" onClick={() => onNavigate('careerAi')}><Play className="h-4 w-4 fill-current" /><span>See it in action</span></MagneticButton>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 1.05 }} className="marketing-proof">
          <span className="marketing-avatars"><i>AR</i><i>FA</i><i>MK</i></span><span><b>50,000+</b> students already exploring what’s next</span><span className="marketing-rating"><Star className="h-3.5 w-3.5 fill-current" /> 4.9</span>
        </motion.div>
      </div>

      <motion.div className="marketing-hero-float marketing-float-insight" animate={reduceMotion ? undefined : { y: [0, -12, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}>
        <span>Career match</span><strong>94% aligned</strong><em>↑ 12 points this week</em>
      </motion.div>
      <motion.div className="marketing-hero-float marketing-float-path" animate={reduceMotion ? undefined : { y: [0, 12, 0] }} transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
        <span className="marketing-float-dot" /><div><span>Next milestone</span><strong>Choose your pathway</strong></div>
      </motion.div>
    </section>
  );
}
