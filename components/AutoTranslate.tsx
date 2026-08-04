import React, { useEffect } from 'react';

// Declare types for window object to satisfy TypeScript compiler
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            language_code?: string;
          };
        };
      };
    };
  }
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

const SUPPORTED_LANG_CODES = LANGUAGES.map(l => l.code);

export const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/;`;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('user_language');
  if (saved && SUPPORTED_LANG_CODES.includes(saved)) {
    return saved;
  }

  // Telegram WebApp detection
  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (tgLang) {
    const cleanTg = tgLang.split('-')[0].toLowerCase();
    if (SUPPORTED_LANG_CODES.includes(cleanTg)) {
      return cleanTg;
    }
  }

  // Browser detection
  const navLang = navigator.language;
  if (navLang) {
    const cleanNav = navLang.split('-')[0].toLowerCase();
    if (SUPPORTED_LANG_CODES.includes(cleanNav)) {
      return cleanNav;
    }
  }

  return 'en';
};

export const triggerGoogleTranslate = (langCode: string) => {
  setCookie('googtrans', `/en/${langCode}`);
  const gtSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (gtSelect) {
    gtSelect.value = langCode;
    gtSelect.dispatchEvent(new Event('change'));
  }
};

export const setLanguage = (langCode: string) => {
  if (!SUPPORTED_LANG_CODES.includes(langCode)) return;
  localStorage.setItem('user_language', langCode);
  triggerGoogleTranslate(langCode);
  window.dispatchEvent(new CustomEvent('languageChange', { detail: langCode }));
};

export const AutoTranslate: React.FC = () => {
  useEffect(() => {
    // Add Google Translate script if not exists
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );

          // Apply saved language after init
          const savedLang = getSavedLanguage();
          if (savedLang && savedLang !== 'en') {
            setTimeout(() => {
              triggerGoogleTranslate(savedLang);
            }, 800);
          }
        }
      };
    }
  }, []);

  return <div id="google_translate_element" className="hidden" style={{ display: 'none' }} />;
};

