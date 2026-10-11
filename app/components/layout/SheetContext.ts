import * as React from 'react';

/** True for components rendered inside a `Sheet`, which need `BottomSheetTextInput`s to cooperate with the keyboard */
export const SheetContext = React.createContext(false);

export function useInSheet(): boolean {
  return React.useContext(SheetContext);
}
