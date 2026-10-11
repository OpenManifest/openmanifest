import * as React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AppThemeContext, useCreateAppTheme } from './useAppTheme';

export default function AppThemeProvider(props: { children: React.ReactNode }) {
  const state = useCreateAppTheme();

  return (
    <AppThemeContext.Provider value={state}>
      <PaperProvider theme={state.theme}>{props.children}</PaperProvider>
    </AppThemeContext.Provider>
  );
}
