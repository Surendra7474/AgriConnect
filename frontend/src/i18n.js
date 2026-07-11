import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import te from './locales/te/translation.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => {
        const supported = ['en', 'hi', 'te'];
        const normalized = lng?.split('-')[0]?.toLowerCase() || 'en';
        return supported.includes(normalized) ? normalized : 'en';
      },
    },
  });

export default i18n;
