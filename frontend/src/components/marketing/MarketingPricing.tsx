import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MagneticButton } from './MagneticButton';

export function MarketingPricing({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [annual, setAnnual] = useState(true);
  const plans = [
    { name: 'Explorer', price: 'Free', description: 'A thoughtful place to begin.', features: ['RIASEC assessment', 'University explorer', 'Scholarship search'] },
    { name: 'Momentum', price: annual ? '499' : '59', description: 'For students ready to build traction.', features: ['Unlimited AI counselor', 'Resume intelligence', 'Career roadmap', 'Mock interview practice'], featured: true },
    { name: 'Institution', price: 'Let’s talk', description: 'For schools building confident cohorts.', features: ['Institution analytics', 'Student progress', 'Mentor workspaces'] },
  ];
  return <section className="marketing-section marketing-pricing-section"><div className="marketing-section-heading"><span className="marketing-eyebrow">Plans that make sense</span><h2>Start free. Grow with clarity.</h2><p>Great guidance should be within reach, whatever stage you’re at.</p></div><div className="marketing-price-toggle"><button onClick={() => setAnnual(false)} className={!annual ? 'is-active' : ''}>Monthly</button><button onClick={() => setAnnual(true)} className={annual ? 'is-active' : ''}>Yearly <b>Save 18%</b></button></div><div className="marketing-pricing-grid">{plans.map((plan, index) => <motion.article key={plan.name} initial={{ opacity: 0, y: 30, rotateY: -6 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.55 }} className={`marketing-price-card ${plan.featured ? 'is-featured' : ''}`}>{plan.featured && <span className="marketing-popular"><Sparkles className="h-3.5 w-3.5" /> Most popular</span>}<span className="marketing-plan-name">{plan.name}</span><p>{plan.description}</p><div className="marketing-price"><AnimatePresence mode="wait"><motion.strong key={plan.price} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>{plan.price === '499' || plan.price === '59' ? `PKR ${plan.price}` : plan.price}</motion.strong></AnimatePresence>{plan.price === '499' && <span>/ year</span>}{plan.price === '59' && <span>/ month</span>}</div><ul>{plan.features.map((feature) => <li key={feature}><Check className="h-4 w-4" />{feature}</li>)}</ul><MagneticButton variant={plan.featured ? 'primary' : 'secondary'} onClick={() => onNavigate(plan.featured ? 'careerAi' : 'auth')}>{plan.featured ? 'Choose Momentum' : 'Get started'}</MagneticButton></motion.article>)}</div></section>;
}
