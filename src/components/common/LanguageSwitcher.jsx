import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/I18nContext.jsx';

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage();
  const currentLng = lang || 'en';

  const toggleLanguage = () => {
    const nextLng = currentLng.startsWith('ur') ? 'en' : 'ur';
    setLang(nextLng);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Switch Language / زبان تبدیل کریں"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer ${className}`}
    >
      <Globe className="h-3.5 w-3.5 text-emerald-400" />
      <span>{currentLng.startsWith('ur') ? 'English' : 'اردو'}</span>
    </button>
  );
}

export default LanguageSwitcher;
