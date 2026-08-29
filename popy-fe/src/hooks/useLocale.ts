import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  LOCALE_LABELS,
  type Locale,
} from '@/i18n/languages';

export const useLocale = () => {
  const { i18n } = useTranslation();
  const locale: Locale = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;

  const setLocale = useCallback(
    (next: Locale) => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  return {
    locale,
    setLocale,
    locales: LOCALES,
    labels: LOCALE_LABELS,
  };
};
