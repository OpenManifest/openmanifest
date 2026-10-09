import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';

type Variables = Record<string, unknown> | null | undefined;

/**
 * Compares the variables a lazy query was called with against the ones the component wants. Apollo Client 3.14 drops
 * undefined variables from `query.variables`, and lodash's `isEqual({ a: undefined }, {})` is false, so a plain
 * `isEqual` makes an effect that refetches on a mismatch fetch forever.
 */
export default function sameVariables(a: Variables, b: Variables): boolean {
  return isEqual(omitBy(a ?? {}, isUndefined), omitBy(b ?? {}, isUndefined));
}
