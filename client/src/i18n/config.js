import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruTranslations from '../locales/ru.json';
import enTranslations from '../locales/en.json';

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'ru';
  }
  return 'ru';
};

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: ruTranslations,
    },
    en: {
      translation: enTranslations,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false, // React уже экранирует значения
  },
});

export default i18n;
