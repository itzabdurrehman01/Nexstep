import { motion, useReducedMotion } from 'motion/react';

const labels = ['AIR UNIVERSITY', 'HEC PATHWAYS', 'GEMINI AI', 'DIGISKILLS', 'TEVTA', 'CAREER OS', '100+ UNIVERSITIES'];

export function MarketingMarquee() {
  const reduceMotion = useReducedMotion();
  const items = [...labels, ...labels];
  return <section className="marketing-marquee"><p>Built around the institutions and pathways that matter</p><div className="marketing-marquee-window"><motion.div className="marketing-marquee-track" animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>{items.map((label, index) => <span key={`${label}-${index}`}>{label}<i>✦</i></span>)}</motion.div></div></section>;
}
