import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import common from './locales/en/common.json';
import genericTerms from './locales/en/terms.generic.json';
import { mergeTerms, toI18nextTerms, type Terms } from './terms';

export const NAMESPACES = ['common', 'terms'] as const;
export const DEFAULT_LOCALE = 'en-AU';
/** The only language with resources; any other device language falls back to it. */
export const FALLBACK_LOCALE = 'en';

/** The bundled words of the `generic` template: what is shown until an operator's own terms arrive, and for missing keys */
export const fallbackTerms = genericTerms as Terms;

function deviceLocale(): string {
  try {
    return getLocales()[0]?.languageTag || DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  lng: deviceLocale(),
  fallbackLng: FALLBACK_LOCALE,
  supportedLngs: false,
  ns: [...NAMESPACES],
  defaultNS: 'common',
  fallbackNS: 'common',
  resources: { en: { common, terms: toI18nextTerms(fallbackTerms) } },
  interpolation: { escapeValue: false },
  // Terms are swapped when the operator changes; components re-render on it
  react: { bindI18nStore: 'added removed', useSuspense: false },
  // Resources are bundled: initialise synchronously so the first render has its words
  initAsync: false,
});

/**
 * Makes `terms` the `terms` namespace: the generic words with the given terms (an operator's `terminology`) on top, so
 * switching operators never leaves a word of the previous one behind. Without terms the generic words apply.
 */
export function applyTerms(terms?: Terms | null): void {
  i18n.removeResourceBundle(FALLBACK_LOCALE, 'terms');
  i18n.addResourceBundle(
    FALLBACK_LOCALE,
    'terms',
    toI18nextTerms(mergeTerms(fallbackTerms, terms)),
    true,
    true
  );
}

export default i18n;
