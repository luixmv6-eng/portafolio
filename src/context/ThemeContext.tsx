'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const resolved = (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')
      ? savedTheme
      : 'system';
    setTheme(resolved);
    if (resolved !== 'system') {
      document.documentElement.setAttribute('data-theme', resolved);
    }
  }, []);

  // Persist theme to localStorage and update class/html
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
