import * as React from 'react';
import { Appearance } from 'react-native';
import { useAppSelector, useAppDispatch } from 'app/state/store';
import { actions } from 'app/state';

export default function useAppearance() {
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const listener = React.useRef<ReturnType<typeof Appearance.addChangeListener>>(
    Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        dispatch(actions.global.setAppearance(colorScheme));
      }
    })
  );

  /// Listen to changes in Appearance and set dark mode theme in state
  React.useEffect(() => {
    const handler = listener?.current;
    return () => handler?.remove?.();
  }, [dispatch, state.isDarkMode, state.theme.colors.background]);
}
