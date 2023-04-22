import * as React from 'react';
import fastDeepEqual from 'fast-deep-equal';
import { useCustomEqualityCheck } from './useCustomEqualityCheck';

export default function useMemo<Value>(
  valueFn: () => Value,
  dependencies: React.DependencyList,
  isEqual: (current: unknown, next: unknown) => boolean = fastDeepEqual
): Value {
  const deps = useCustomEqualityCheck(dependencies, isEqual);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(valueFn, deps);
}
