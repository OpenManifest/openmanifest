/** A term in the forms of its language (the keys of the backend's `locales/en.yml`) */
export type PluralForms = Partial<
  Record<'zero' | 'one' | 'two' | 'few' | 'many' | 'other', string>
>;

/** The `terminology` of an operator as the API returns it: term => forms, with groups (`crew`, `state`) nested */
export type Terms = { [key: string]: string | PluralForms | Terms };

const FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `{ one: 'Load', other: 'Loads' }`: an object whose keys are all plural forms and whose values are all text */
function isForms(value: unknown): value is PluralForms {
  if (!isObject(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.length > 0 &&
    keys.every((key) => FORMS.includes(key) && typeof value[key] === 'string') &&
    ('one' in value || 'other' in value)
  );
}

/**
 * The terms in i18next's format: `load: { one, other }` becomes `load_one`, `load_other` (what `t('terms:load', { count })`
 * looks up) and `load`, the singular, so `t('terms:load')` without a count works too.
 */
export function toI18nextTerms(terms: Terms | null | undefined): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.entries(terms ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = value;
    } else if (isForms(value)) {
      const forms = value as PluralForms;
      Object.entries(forms).forEach(([form, text]) => {
        result[`${key}_${form}`] = text;
      });
      result[key] = forms.one ?? forms.other;
    } else if (isObject(value)) {
      result[key] = toI18nextTerms(value as Terms);
    }
  });
  return result;
}

/** Deep merge: maps merge, anything else is replaced by the override */
export function mergeTerms(base: Terms, override: Terms | null | undefined): Terms {
  const result: Terms = { ...base };

  Object.entries(override ?? {}).forEach(([key, value]) => {
    const current = result[key];
    result[key] =
      isObject(current) && isObject(value) && !isForms(value)
        ? mergeTerms(current as Terms, value as Terms)
        : value;
  });
  return result;
}
