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

const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'ar', 'fr', 'sw', 'hi', 'ru', 'zh', 'tr'];

const setCookie = (name: string, value: string) => {
  const domain = window.location.hostname;
  document.cookie = `${name}=${value}; path=/;`;
  document.cookie = `${name}=${value}; path=/; domain=${domain};`;
  document.cookie = `${name}=${value}; path=/; domain=.${domain};`;

  if (domain.includes('.')) {
    const parts = domain.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.');
      document.cookie = `${name}=${value}; path=/; domain=.${parentDomain};`;
    }
  }
};

const deleteCookie = (name: string) => {
  const domain = window.location.hostname;
  const expired = '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = `${name}${expired}`;
  document.cookie = `${name}${expired} domain=${domain};`;
  document.cookie = `${name}${expired} domain=.${domain};`;

  if (domain.includes('.')) {
    const parts = domain.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.');
      document.cookie = `${name}${expired} domain=.${parentDomain};`;
    }
  }
};

export const AutoTranslate: React.FC = () => {
  useEffect(() => {
    // 1. Detect language in priority order
    const getTargetLanguage = (): string => {
      // Priority A: Telegram WebApp user language
      const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
      if (tgLang) {
        const cleanTg = tgLang.split('-')[0].toLowerCase();
        if (SUPPORTED_LANGUAGES.includes(cleanTg)) {
          return cleanTg;
        }
      }

      // Priority B: Browser / Device language
      const navLang = navigator.language;
      if (navLang) {
        const cleanNav = navLang.split('-')[0].toLowerCase();
        if (SUPPORTED_LANGUAGES.includes(cleanNav)) {
          return cleanNav;
        }
      }

      // Priority C: Default to English
      return 'en';
    };

    const targetLang = getTargetLanguage();

    // Do NOT translate if target language is English
    if (targetLang === 'en') {
      deleteCookie('googtrans');
      return;
    }

    // Set cookie before loading Google Translate to trigger auto-translation
    setCookie('googtrans', `/en/${targetLang}`);

    // Set initialization callback for Google Translate Element
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: window.google.translate.TranslateElement?.InlineLayout?.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Translate Element script if not already present
    let script = document.getElementById('google-translate-script') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Re-trigger init callback if script was already loaded previously
      if (typeof window.googleTranslateElementInit === 'function') {
        window.googleTranslateElementInit();
      }
    }

    return () => {
      // Cleanup on unmount
      deleteCookie('googtrans');
      const scriptToRemove = document.getElementById('google-translate-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      delete window.googleTranslateElementInit;

      // Reset any google styles set on body/html
      document.body.style.top = '';
      document.body.style.position = '';
      document.documentElement.style.marginTop = '';
    };
  }, []);

  return (
    <>
      {/* Dynamic invisible container for Google Translate widget mount */}
      <div 
        id="google_translate_element" 
        style={{ display: 'none', width: '0px', height: '0px', opacity: 0, pointerEvents: 'none' }} 
        className="hidden pointer-events-none" 
      />
      {/* Stylesheet injector to completely hide all Translate frames with zero layout shifts */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Completely hide translation frames, banners, highlighters or tooltips */
        iframe.goog-te-banner-frame,
        iframe[class*="goog-te-banner-frame"],
        iframe.skiptranslate,
        iframe.VIpgJd-y68nd-JNax6b-bHlhme,
        .goog-te-banner-frame,
        .skiptranslate,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-te-balloon-frame * {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0px !important;
          width: 0px !important;
        }
        /* Lock layout shift */
        body {
          top: 0px !important;
          position: static !important;
        }
        html {
          margin-top: 0px !important;
          top: 0px !important;
        }
        .goog-logo-link,
        .goog-te-gadget,
        .goog-te-gadget span,
        #google_translate_element {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0px !important;
          width: 0px !important;
        }
      `}} />
    </>
  );
};
