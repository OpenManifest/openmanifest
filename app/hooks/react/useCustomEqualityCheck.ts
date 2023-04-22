import { useRef } from 'react';
import _isEqual from 'lodash/isEqual';

function checkEqualityWithFallback(
  current: React.DependencyList,
  next: React.DependencyList,
  isEqual: typeof _isEqual
) {
  try {
    return isEqual(current, next);
  } catch {
    return _isEqual(current, next);
  }
}

export function useCustomEqualityCheck(
  value: React.DependencyList,
  isEqual: (current: React.DependencyList, next: React.DependencyList) => boolean = _isEqual
): React.DependencyList {
  const ref = useRef<React.DependencyList>([]);

  // Use a fallback if isEqual throw and fallback on lodash/isEqual
  if (!checkEqualityWithFallback(value, ref.current, isEqual)) {
    ref.current = value;
  }

  return ref.current;
}
