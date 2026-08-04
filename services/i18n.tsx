import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS, SupportedLanguage } from '../locales/translations';
import { LANGUAGES, LanguageOption } from '../components/AutoTranslate';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
}

const SUPPORTED_CODES: SupportedLanguage[] = [
  'en', 'es', 'pt', 'fr', 'de', 'ar', 'sw', 'hi', 'ru', 'zh', 'tr', 'it'
];

const getInitialLanguage = (): SupportedLanguage => {
  try {
    const saved = localStorage.getItem('user_language') as SupportedLanguage;
    if (saved && SUPPORTED_CODES.includes(saved)) {
      return saved;
    }

    // Check Telegram WebApp language
    const tgLang = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang) {
      const cleanTg = tgLang.split('-')[0].toLowerCase() as SupportedLanguage;
      if (SUPPORTED_CODES.includes(cleanTg)) {
        return cleanTg;
      }
    }

    // Check Navigator language
    const navLang = navigator.language;
    if (navLang) {
      const cleanNav = navLang.split('-')[0].toLowerCase() as SupportedLanguage;
      if (SUPPORTED_CODES.includes(cleanNav)) {
        return cleanNav;
      }
    }
  } catch (err) {
    console.warn('Error reading initial language preference:', err);
  }

  return 'en';
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  useEffect(() => {
    const saved = getInitialLanguage();
    setLanguageState(saved);

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && SUPPORTED_CODES.includes(customEvent.detail as SupportedLanguage)) {
        setLanguageState(customEvent.detail as SupportedLanguage);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    if (!SUPPORTED_CODES.includes(lang)) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('user_language', lang);
      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
    } catch (err) {
      console.warn('Could not save language to localStorage:', err);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  return useContext(LanguageContext);
};
