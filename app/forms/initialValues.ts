import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';

/**
 * The defaults of a form with the initial values on top. An initial value that is `undefined` (the dialogs build theirs
 * from an original record that does not exist when creating) leaves the default alone instead of overriding it.
 */
export default function withDefaults<T extends object>(defaults: T, initial?: Partial<T>): T {
  return { ...defaults, ...omitBy(initial, isUndefined) } as T;
}
