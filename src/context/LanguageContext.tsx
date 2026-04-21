'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

import translationsJson from '../locales/translations.json';

type TranslationTree = { [key: string]: string | TranslationTree };
type TranslationsRoot = Record<Language, TranslationTree>;
const translations = translationsJson as unknown as TranslationsRoot;

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'es';
    const savedLang = localStorage.getItem('language');
    return savedLang === 'es' || savedLang === 'en' ? savedLang : 'es';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = useMemo(
    () => (key: string) => {
      const keys = key.split('.');
      let value: string | TranslationTree | undefined = translations[language];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }

      return typeof value === 'string' ? value : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
