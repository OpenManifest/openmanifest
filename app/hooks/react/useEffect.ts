import * as React from 'react';
import { useCustomEqualityCheck } from './useCustomEqualityCheck';

export default function useEffect<EffectFn extends () => void | (() => void), Dependencies extends unknown[] = []>(
  effect: EffectFn,
  dependencies?: Dependencies,
  isEqual?: (current: React.DependencyList, next: React.DependencyList) => boolean
): void {
  // Memoize the effect with the dependencies
  // then run it whenever it changes
  const deps = useCustomEqualityCheck(dependencies as Dependencies, isEqual);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, deps);
}
