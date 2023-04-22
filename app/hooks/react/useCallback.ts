import * as React from 'react';
import { useCustomEqualityCheck } from './useCustomEqualityCheck';

function useCallback<
  // rome-ignore lint/suspicious/noExplicitAny: This has to be any for typechecking to infer it
  MemoizedFn extends (...args: any[]) => any,
  Dependencies extends React.DependencyList
>(
  value: MemoizedFn,
  dependencies: Dependencies,
  isEqual?: (current: React.DependencyList, next: React.DependencyList) => boolean
): MemoizedFn {
  const deps = useCustomEqualityCheck(dependencies, isEqual);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(value, deps);
}

export default useCallback;
