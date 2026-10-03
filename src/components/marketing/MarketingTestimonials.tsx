import { useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import { useScrollProgress } from '../../hooks/useScrollProgress';

const stories = [
  { name: 'Areeba Khan', role: 'FSc Pre-Medical · Lahore', quote: 'It made the next step feel smaller, clearer, and actually possible.' },
  { name: 'Hassan Raza', role: 'ICS · Islamabad', quote: 'For the first time, I could see a real path from my interests to a career.' },
  { name: 'Maha Iqbal', role: 'Matric · Karachi', quote: 'My family and I finally had the same picture of the options ahead.' },
];

export function MarketingTestimonials() {
  const progress = useScrollProgress();
  const [rotation, setRotation] = useState(0);
  const reduceMotion = useReducedMotion();
  useMotionValueEvent(progress, 'change', (latest) => { if (!reduceMotion) setRotation((latest - 0.5) * 7); });
  return <section className="marketing-section marketing-testimonial-section"><div className="marketing-section-heading"><span className="marketing-eyebrow">Built for real decisions</span><h2>Clarity changes how<br /><span>you move forward.</span></h2></div><motion.div className="marketing-testimonial-stage" animate={reduceMotion ? undefined : { rotateY: rotation }} transition={{ type: 'spring', stiffness: 65, damping: 20 }}>{stories.map((story, index) => <motion.article key={story.name} className="marketing-testimonial-card" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -9, rotateX: 2 }}><Quote className="h-8 w-8" /><div className="marketing-stars"><Star /><Star /><Star /><Star /><Star /></div><p>“{story.quote}”</p><footer><b>{story.name}</b><span>{story.role}</span></footer></motion.article>)}</motion.div></section>;
}
