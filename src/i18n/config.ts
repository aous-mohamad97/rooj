import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
  });

// Set document direction based on language (client-side only)
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    const isRTL = lng === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    
    // Update body class for RTL styling
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  });
}

// Initialize direction on load
if (typeof window !== 'undefined') {
  const currentLang = i18n.language || 'en';
  const isRTL = currentLang === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.body.classList.toggle('rtl', isRTL);
  document.body.classList.toggle('ltr', !isRTL);
}

export default i18n;

