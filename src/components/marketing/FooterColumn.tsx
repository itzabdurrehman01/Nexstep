import { motion } from 'motion/react';

interface FooterColumnProps { title: string; links: string[]; }

export function FooterColumn({ title, links }: FooterColumnProps) {
  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} className="marketing-footer-column"><b>{title}</b>{links.map((link, index) => <motion.a key={link} href="#top" initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }}>{link}</motion.a>)}</motion.div>;
}

export default FooterColumn;
