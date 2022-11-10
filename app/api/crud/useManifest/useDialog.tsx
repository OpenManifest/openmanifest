import * as React from 'react';

export default function createUseDialog<State extends object = object>(defaults?: State) {
  return function useDialog() {
    const [state, setState] = React.useState<State>();
    const open = React.useCallback((newState: State) => {
      setState({ ...defaults, ...newState });
    }, []);
    const close = React.useCallback(() => setState(undefined), []);

    return { state, visible: !!state, open, close };
  };
}
