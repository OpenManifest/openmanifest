import * as React from 'react';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from 'app/ui/theme';
import { AppThemeContext, useCreateAppTheme } from './useAppTheme';

export default function AppThemeProvider(props: { children: React.ReactNode }) {
  const state = useCreateAppTheme();

  return (
    <AppThemeContext.Provider value={state}>
      <ThemeProvider scheme={state.isDark ? 'dark' : 'light'} brand={state.brand}>
        <PaperProvider theme={state.theme}>{props.children}</PaperProvider>
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}
