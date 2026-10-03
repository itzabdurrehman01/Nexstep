import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../utils/cn';

interface GradientOrbProps { className?: string; delay?: number; duration?: number; }

export function GradientOrb({ className, delay = 0, duration = 12 }: GradientOrbProps) {
  const reduceMotion = useReducedMotion();
  return <motion.div aria-hidden="true" className={cn('marketing-gradient-orb', className)} animate={reduceMotion ? undefined : { x: [0, 15, 0], y: [0, -10, 0] }} transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />;
}

export default GradientOrb;
