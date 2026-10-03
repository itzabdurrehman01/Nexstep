import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Bot, Compass, GraduationCap, LineChart, Radar, Sparkles } from 'lucide-react';

const features = [
  { title: 'Your career, in focus.', copy: 'A complete career compass built around your interests, marks, and momentum.', icon: Compass, className: 'marketing-bento-featured', accent: 'emerald' },
  { title: 'AI that explains itself.', copy: 'Practical recommendations with the why behind every suggestion.', icon: Bot, className: 'marketing-bento-ai', accent: 'violet' },
  { title: 'Opportunity, decoded.', copy: 'Compare universities, scholarships, and market demand in one place.', icon: GraduationCap, className: 'marketing-bento-wide', accent: 'gold' },
  { title: 'Momentum you can see.', copy: 'Turn milestones into a plan you want to keep moving through.', icon: LineChart, className: 'marketing-bento-mini', accent: 'emerald' },
  { title: 'A map for the future.', copy: 'See where you are and the smartest way forward.', icon: Radar, className: 'marketing-bento-mini', accent: 'violet' },
];

function TiltCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();
  const Icon = feature.icon;
  return (
    <motion.article
      className={`marketing-bento-card ${feature.className}`}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      animate={reduceMotion ? undefined : { rotateX: tilt.y, rotateY: tilt.x }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        setTilt({ x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 7, y: ((event.clientY - bounds.top) / bounds.height - 0.5) * -7 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className={`marketing-bento-icon marketing-bento-icon-${feature.accent}`}><Icon className="h-5 w-5" /></div>
      <div className="marketing-bento-copy"><h3>{feature.title}</h3><p>{feature.copy}</p></div>
      {index === 0 && <div className="marketing-bento-graph"><span /><span /><span /><span /><span /></div>}
      {index === 1 && <div className="marketing-bento-ai-orb"><Sparkles className="h-5 w-5" /></div>}
      {index === 2 && <div className="marketing-bento-track"><i /><i /><i /></div>}
    </motion.article>
  );
}

export function MarketingBento() {
  return (
    <section className="marketing-section marketing-bento-section">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="marketing-section-heading">
        <span className="marketing-eyebrow">Designed for momentum</span>
        <h2>Everything connects.<br /><span>So your next move does too.</span></h2>
        <p>No disconnected tools. Just one intelligent space to understand your options and start moving with purpose.</p>
      </motion.div>
      <div className="marketing-bento-grid">{features.map((feature, index) => <TiltCard key={feature.title} feature={feature} index={index} />)}</div>
    </section>
  );
}
