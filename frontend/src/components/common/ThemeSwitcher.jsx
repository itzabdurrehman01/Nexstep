import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sparkles, Sunset, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (id) => {
    switch (id) {
      case 'dark':
        return <Moon className="h-3.5 w-3.5" />;
      case 'aurora':
        return <Sparkles className="h-3.5 w-3.5 text-cyan-400" />;
      case 'sunrise':
        return <Sunset className="h-3.5 w-3.5 text-amber-500" />;
      case 'light':
      default:
        return <Sun className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Switch Theme"
        title={`Current theme: ${theme}. Click to change.`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold backdrop-blur-md transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
      >
        <span className="shrink-0">{getThemeIcon(theme)}</span>
        <span className="hidden sm:inline capitalize text-[11px] font-bold">
          {themes.find((t) => t.id === theme)?.label || theme}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-1.5 px-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-900/15 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Appearance
          </div>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0 border border-slate-300 dark:border-slate-600"
                    style={{ background: t.swatch }}
                  />
                  <span>{t.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
