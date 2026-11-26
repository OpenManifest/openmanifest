import * as React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The operator's words: `term('load')` is "Load", `term('load', 2)` "Loads", `term('crew.pilot')` "Pilot" (a skydiving
 * operator's words, a bus operator's "Trip"). Pass the result into sentences: `t('common:newLoad', { load: term('load') })`.
 */
export default function useTerms() {
  const { t } = useTranslation('terms');

  return React.useCallback((key: string, count = 1) => t(key, { count }), [t]);
}
