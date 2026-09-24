import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'MAHOGANY' | 'NIGHT_INDIGO';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'fekri_no_active_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'MAHOGANY' || stored === 'NIGHT_INDIGO') {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to read theme from storage', e);
    }
    return 'MAHOGANY';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme to storage', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'MAHOGANY' ? 'NIGHT_INDIGO' : 'MAHOGANY');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'NIGHT_INDIGO') {
      root.classList.add('theme-night-indigo');
      root.classList.remove('theme-mahogany');
    } else {
      root.classList.add('theme-mahogany');
      root.classList.remove('theme-night-indigo');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
