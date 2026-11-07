import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './index';
import type { Terms } from './terms';
import useOperatorTerms from './useOperatorTerms';

type I18nProviderProps = {
  /** Terms that win over the operator's (tests, the gallery) */
  terms?: Terms | null;
  children: React.ReactNode;
};

/** Provides i18next and follows the current operator's terminology. Needs Apollo and the session store. */
export default function I18nProvider({ terms, children }: I18nProviderProps) {
  useOperatorTerms(terms);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
