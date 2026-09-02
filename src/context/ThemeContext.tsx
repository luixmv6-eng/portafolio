'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme';
const EVENT = 'themechange';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

// localStorage es un sistema externo, asi que se lee con useSyncExternalStore
// en vez de setState dentro de un efecto: no hay render en cascada al montar y
// el snapshot de servidor esta definido.
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function getServerSnapshot(): Theme {
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Modo privado o almacenamiento bloqueado: el tema aplica solo a esta vista.
    }

    // 'system' quita el atributo y deja que `prefers-color-scheme` decida en
    // CSS. Antes se escribia data-theme="light|dark" tambien para 'system', lo
    // que convertia "seguir al sistema" en una eleccion fija.
    if (newTheme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }

    window.dispatchEvent(new Event(EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
