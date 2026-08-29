export const LOCALES = ['en', 'si'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'popy.locale';

export const LOCALE_LABELS: Record<Locale, { short: string; native: string }> = {
  en: { short: 'EN', native: 'English' },
  si: { short: 'සිං', native: 'සිංහල' },
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && LOCALES.includes(value as Locale);
