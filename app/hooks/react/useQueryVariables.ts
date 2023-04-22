//
// Memo function for query variables where we don't care about the order of arrays
//
import isEqual from 'lodash/isEqual';
import mapValues from 'lodash/mapValues';
import useMemo from './useMemo';

function withUnorderedArrays(obj) {
  if (Array.isArray(obj)) {
    return new Set([...obj].map(withUnorderedArrays));
  }
  if (typeof obj === 'object' && obj !== null) {
    return mapValues(obj, withUnorderedArrays); // Recursion for object values
  }
  // Not an array, nor an object, return as normal
  return obj;
}

function isEqualWithUnorderedArrays(a, b) {
  return isEqual(withUnorderedArrays(a), withUnorderedArrays(b));
}

/**
 * Equality check which ignores the order of arrays
 * @param - The varaibles for the query
 * @returns - The original variables untouched.
 */
export default function useQueryVariables<T extends { [key: string]: unknown }>(variables: T): T {
  return useMemo(() => variables, [variables], isEqualWithUnorderedArrays);
}
