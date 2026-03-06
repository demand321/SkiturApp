import { useCallback } from 'react';
import { create } from 'zustand';
import nb from './translations/nb';
import en from './translations/en';
import type { TranslationKeys } from './translations/nb';

export type Locale = 'nb' | 'en';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'nb',
  setLocale: (locale) => set({ locale }),
}));

const translations: Record<Locale, TranslationKeys> = { nb, en };

/**
 * Resolve a dot-notation key like 'common.cancel' to its value in the
 * translations object.  Returns the key itself when no match is found.
 */
function resolve(obj: Record<string, any>, path: string): string {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return path;
    }
    current = current[part];
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Hook that returns a translation function `t`.
 *
 * Usage:
 * ```ts
 * const { t } = useTranslation();
 * t('common.cancel')        // "Avbryt" (nb) / "Cancel" (en)
 * ```
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);

  const t = useCallback(
    (key: string): string => {
      return resolve(translations[locale] as Record<string, any>, key);
    },
    [locale],
  );

  return { t, locale };
}

export type { TranslationKeys };
