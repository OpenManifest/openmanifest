import * as React from 'react';
import { Snackbar } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../state';

import slice from './slice';
import usePalette from '../../hooks/usePalette';

const { actions } = slice;

const MyComponent = () => {
  const state = useAppSelector((root) => root.notifications);
  const dispatch = useAppDispatch();
  const palette = usePalette();

  const notification = state.queue.length ? state.queue[0] : null;

  const variantStyle = {
    info: { backgroundColor: palette.info },
    success: { backgroundColor: palette.success },
    error: { backgroundColor: palette.error },
    warning: { backgroundColor: palette.warning },
  };

  return (
    <Snackbar
      testID="snackbar-message"
      visible={!!notification}
      onDismiss={() => dispatch(actions.hideSnackbar())}
      duration={3000}
      action={notification?.action}
      style={!!notification?.variant && variantStyle[notification.variant]}
    >
      {notification?.message}
    </Snackbar>
  );
};

export default MyComponent;
