import { ArrowRight, Github, Instagram, Linkedin, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../../assets/images/nexstep_logo_1786045525796.png';
import { MagneticButton } from './MagneticButton';
import { GradientOrb } from './GradientOrb';
import { FooterColumn } from './FooterColumn';

interface MarketingFooterProps { onNavigate: (tab: string) => void; lang?: string; }
const columns = [{ title: 'Product', links: ['Features', 'Pricing', 'Career AI', 'Roadmap'] }, { title: 'Resources', links: ['Universities', 'Scholarships', 'Guides', 'Help centre'] }, { title: 'Company', links: ['About NexStep', 'Contact', 'Partners', 'Status'] }, { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Licenses'] }];
const social = [Github, Linkedin, Instagram, Send];

export function MarketingFooter({ onNavigate, lang = 'en' }: MarketingFooterProps) {
  const isUrdu = lang === 'ur';
  const copy = isUrdu ? {
    eyebrow: 'اپنے موجودہ مقام سے آغاز کریں', title: <>آپ کا مستقبل<br />غیریقینی نہیں رہنا چاہیے۔</>, description: 'درست معلومات، اعتماد اور واضح راستے کے ساتھ اپنا اگلا فیصلہ کریں۔', cta: 'میرا اگلا قدم تلاش کریں',
    stay: 'باخبر رہیں', newsletter: 'نئے راستے، مواقع اور رہنمائی — کبھی کبھار۔', subscribe: 'سبسکرائب کریں',
    brand: 'پاکستان میں اپنی اگلی تعمیر کرنے والی نسل کے لیے کیریئر انٹیلیجنس۔', free: 'ہمیشہ مفت', powered: 'اے آئی سے تقویت یافتہ', pakistan: 'پاکستان کے لیے تیار کردہ',
    rights: '© 2026 نیکسٹ اسٹیپ اے آئی · جملہ حقوق محفوظ ہیں', built: 'نیکسٹ اسٹیپ ٹیم نے محبت سے بنایا', legal: 'پرائیویسی · شرائط · کوکیز',
  } : {
    eyebrow: 'Start where you are', title: <>Your future doesn’t need<br />to feel uncertain.</>, description: 'Make the next choice with context, confidence, and a path you can see.', cta: 'Find my next step',
    stay: 'Stay in the loop', newsletter: 'New pathways, opportunities, and guidance—occasionally.', subscribe: 'Subscribe',
    brand: 'Career intelligence for the generation building what’s next in Pakistan.', free: 'Free forever', powered: 'AI-powered', pakistan: 'Built for Pakistan',
    rights: '© 2026 NexStep AI · All rights reserved', built: 'Built with ♥ by the NexStep team', legal: 'Privacy · Terms · Cookies',
  };
  const localizedColumns = isUrdu ? [{ title: 'پروڈکٹ', links: ['خصوصیات', 'قیمتیں', 'کیریئر اے آئی', 'روڈ میپ'] }, { title: 'وسائل', links: ['یونیورسٹیاں', 'اسکالرشپس', 'گائیڈز', 'مدد مرکز'] }, { title: 'کمپنی', links: ['نیکسٹ اسٹیپ کے بارے میں', 'رابطہ', 'شراکت دار', 'اسٹیٹس'] }, { title: 'قانونی', links: ['پرائیویسی', 'شرائط', 'کوکیز', 'لائسنس'] }] : columns;
  return <footer role="contentinfo" className="marketing-footer"><div className="marketing-footer-grid" /><GradientOrb className="marketing-footer-orb marketing-footer-orb-left" /><GradientOrb className="marketing-footer-orb marketing-footer-orb-center" delay={1.5} duration={14} /><GradientOrb className="marketing-footer-orb marketing-footer-orb-right" delay={.8} duration={11} /><motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} className="marketing-footer-cta"><span className="marketing-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {copy.eyebrow}</span><h2>{copy.title}</h2><p>{copy.description}</p><MagneticButton onClick={() => onNavigate('quiz')}>{copy.cta} <ArrowRight className="h-4 w-4" /></MagneticButton></motion.section><section className="marketing-newsletter"><div><b>{copy.stay}</b><span>{copy.newsletter}</span></div><form onSubmit={(event) => event.preventDefault()}><input aria-label="Email address" type="email" placeholder="you@example.com" /><MagneticButton type="submit">{copy.subscribe}</MagneticButton></form></section><section className="marketing-footer-content"><div className="marketing-footer-brand"><div className="marketing-footer-brand-lockup"><img src={logoImg} alt="NexStep AI" /><b>NexStep<span>.AI</span></b></div><p>{copy.brand}</p><div className="marketing-footer-pills"><span>✦ {copy.free}</span><span>✦ {copy.powered}</span><span>✦ {copy.pakistan}</span></div><div className="marketing-socials">{social.map((Icon, index) => <motion.a key={index} aria-label="NexStep social link" href="#top" whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: .95 }}><Icon className="h-3.5 w-3.5" /></motion.a>)}</div></div><div className="marketing-footer-columns">{localizedColumns.map((column) => <FooterColumn key={column.title} {...column} />)}</div></section><div className="marketing-footer-bottom"><span>{copy.rights}</span><span>{copy.built}</span><span>{copy.legal}</span></div></footer>;
}

export default MarketingFooter;
