import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { motion, useInView, useMotionValue, useReducedMotion } from 'motion/react';

interface AnimatedCounterProps { value: number; suffix?: string; }

export function AnimatedCounter({ value, suffix = '' }: AnimatedCounterProps) {
  const node = useRef<HTMLSpanElement>(null);
  const visible = useInView(node, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const counter = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) { setDisplay(value); return; }
    const controls = animate(counter, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
    const unsubscribe = counter.on('change', (latest) => setDisplay(Math.round(latest)));
    return () => { controls.stop(); unsubscribe(); };
  }, [counter, reduceMotion, value, visible]);

  return <motion.span ref={node}>{display.toLocaleString()}{suffix}</motion.span>;
}
