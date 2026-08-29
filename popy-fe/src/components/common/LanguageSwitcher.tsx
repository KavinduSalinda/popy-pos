import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import type { Locale } from '@/i18n/languages';
import './LanguageSwitcher.css';

type LanguageSwitcherProps = {
  className?: string;
};

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { t } = useTranslation('common');
  const { locale, setLocale, locales, labels } = useLocale();

  return (
    <div
      className={['lang-switch', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={t('language.switchTo')}
    >
      {locales.map((code: Locale) => (
        <button
          key={code}
          type="button"
          className={locale === code ? 'is-active' : undefined}
          aria-pressed={locale === code}
          aria-label={labels[code].native}
          onClick={() => setLocale(code)}
        >
          {labels[code].short}
        </button>
      ))}
    </div>
  );
};
