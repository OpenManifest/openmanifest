import { ThemeProvider } from '@mui/material';
import { Theme, createTheme } from '@mui/material/styles';
import * as React from 'react';
import { Provider as MaterialProvider } from 'react-native-paper';

import { actions, useAppDispatch, useAppSelector } from './state/store';

function Content(props: { children: React.ReactNode }) {
  const { children } = props;
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const muiTheme: Theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: state.palette.primary,
          secondary: state.palette.accent,
          background: {
            default: state.palette.background,
            paper: state.palette.surface,
          },
          mode: state.theme.dark ? 'dark' : 'light',
          common: {
            white: state.palette.background,
            black: state.palette.onSurface,
          },
        },
      }),
    [
      state.palette.accent,
      state.palette.background,
      state.palette.onSurface,
      state.palette.primary,
      state.palette.surface,
      state.theme.dark,
    ]
  );

  window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
    dispatch(actions.global.setAppearance(e.matches ? 'dark' : 'light'));
  });
  return (
    <MaterialProvider theme={state.theme as ReactNativePaper.Theme}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </MaterialProvider>
  );
}
export default Content;
