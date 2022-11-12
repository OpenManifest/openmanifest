import * as React from 'react';

export interface IDialogContextSubstate<State extends object = object> {
  visible: boolean;
  open(state?: State): void;
  close(): void;
  state?: State;
}
export default function createUseDialog<State extends object = object>(defaults?: State) {
  return function useDialog(): IDialogContextSubstate<State> {
    const [state, setState] = React.useState<State>();
    const open = React.useCallback((newState: State) => {
      setState({ ...defaults, ...newState });
    }, []);
    const close = React.useCallback(() => setState(undefined), []);

    return { state, visible: !!state, open, close };
  };
}
