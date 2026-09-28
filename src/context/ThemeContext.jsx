import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_OPTIONS = [
  { id: 'light', label: 'Pearl', description: 'Crisp & focused', swatch: 'linear-gradient(135deg, #ecfdf5, #dbeafe)' },
  { id: 'dark', label: 'Midnight', description: 'Calm after dark', swatch: 'linear-gradient(135deg, #07111f, #064e3b)' },
  { id: 'aurora', label: 'Aurora', description: 'Vibrant & creative', swatch: 'linear-gradient(135deg, #12132b, #4c1d95 55%, #0e7490)' },
  { id: 'sunrise', label: 'Sunrise', description: 'Warm & optimistic', swatch: 'linear-gradient(135deg, #fff7ed, #fce7f3 55%, #fef3c7)' },
];

const isKnownTheme = (value) => THEME_OPTIONS.some((theme) => theme.id === value);
const DARK_THEMES = new Set(['dark', 'aurora']);

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem('nexstep_theme');
    if (isKnownTheme(savedTheme)) return savedTheme;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch (error) {
    console.warn('Unable to read the saved theme preference:', error);
  }
  return 'light';
}

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
  themes: THEME_OPTIONS,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  const isDark = DARK_THEMES.has(theme);

  const setTheme = (newTheme) => {
    if (isKnownTheme(newTheme)) setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (DARK_THEMES.has(prev) ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('nexstep_theme', theme);
    } catch (e) {
      console.warn('LocalStorage error saving theme:', e);
    }

    const root = document.documentElement;
    root.dataset.nexstepTheme = theme;
    root.dataset.themeMode = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';
    root.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = 'var(--ns-bg)';
    document.body.style.color = 'var(--ns-text)';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0b1220' : '#f4f8f7');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark, themes: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
