import * as React from 'react';
import { ThemeProvider } from 'app/ui/theme';
import { usePreferences } from 'app/state/preferences';
import { AppThemeContext, useCreateAppTheme } from './useAppTheme';

export default function AppThemeProvider(props: { children: React.ReactNode }) {
  const state = useCreateAppTheme();
  const density = usePreferences((preferences) => preferences.density);

  return (
    <AppThemeContext.Provider value={state}>
      <ThemeProvider
        scheme={state.isDark ? 'dark' : 'light'}
        brand={state.brand}
        density={density === 'auto' ? null : density}
      >
        {props.children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}
