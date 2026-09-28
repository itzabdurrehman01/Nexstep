import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedCounter } from '../marketing/AnimatedCounter';
import { MarketingBento } from '../marketing/MarketingBento';
import { MarketingHero } from '../marketing/MarketingHero';
import { MarketingMarquee } from '../marketing/MarketingMarquee';
import { MarketingPricing } from '../marketing/MarketingPricing';
import { MarketingTestimonials } from '../marketing/MarketingTestimonials';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

export function LandingTab({ onNavigate }) {
  const reduceMotion = useReducedMotion();
  useSmoothScroll();

  useEffect(() => {
    document.body.classList.add('marketing-mode');
    return () => document.body.classList.remove('marketing-mode');
  }, []);

  return (
    <div id="top" className="marketing-page">
      <MarketingHero onNavigate={onNavigate} />
      <MarketingMarquee />
      <section className="marketing-impact">
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>A career platform that makes the maze feel navigable.</motion.p>
        <div className="marketing-impact-grid">
          {[['50', 'K+', 'students guided'], ['100', '+', 'universities mapped'], ['1.2', 'K+', 'skill pathways']].map(([value, suffix, label], index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} animate={reduceMotion ? undefined : { y: [0, -5, 0] }}>
              <strong><AnimatedCounter value={Number(value)} suffix={suffix} /></strong><span>{label}</span>
            </motion.div>
          ))}
        </div>
      </section>
      <MarketingBento />
      <MarketingTestimonials />
      <MarketingPricing onNavigate={onNavigate} />
    </div>
  );
}

export default LandingTab;
