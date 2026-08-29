import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from '@/services/storage';
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './languages';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import siCommon from './locales/si/common.json';
import siHome from './locales/si/home.json';

const readSavedLocale = (): Locale => {
  const saved = storage.get<string>(LOCALE_STORAGE_KEY);
  return isLocale(saved) ? saved : DEFAULT_LOCALE;
};

const applyDocumentLocale = (locale: Locale) => {
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
};

export const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  return readSavedLocale();
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, home: enHome },
    si: { common: siCommon, home: siHome },
  },
  lng: getInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: ['common', 'home'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

if (typeof document !== 'undefined') {
  applyDocumentLocale(i18n.language as Locale);
}

i18n.on('languageChanged', (lng) => {
  if (!isLocale(lng)) return;
  storage.set(LOCALE_STORAGE_KEY, lng);
  applyDocumentLocale(lng);
});

export default i18n;
