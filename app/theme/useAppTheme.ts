import * as React from 'react';
import { useOperatorQuery } from 'app/api/reflection';
import useColorScheme from 'app/hooks/useColorScheme';
import { usePreferences } from 'app/state/preferences';
import { useSession } from 'app/state/session';
import { useThemeOverrides } from './overrides';
import { AppPalette, AppTheme, createAppTheme, createPalette } from './palette';

export type AppThemeState = {
  theme: AppTheme;
  palette: AppPalette;
  isDark: boolean;
};

const lightTheme = createAppTheme(false);

export const AppThemeContext = React.createContext<AppThemeState>({
  theme: lightTheme,
  palette: createPalette(lightTheme),
  isDark: false,
});

/**
 * Derives the theme from the colour scheme preference (or the device), the current operator's brand colours (Apollo)
 * and any preview overrides. Called once, by `AppThemeProvider`; components read the result with `useAppTheme()`.
 */
export function useCreateAppTheme(): AppThemeState {
  const preference = usePreferences((state) => state.colorScheme);
  const deviceScheme = useColorScheme();
  const isDark = preference === 'system' ? deviceScheme === 'dark' : preference === 'dark';

  const operatorId = useSession((session) => session.currentOperatorId);
  const loggedIn = useSession((session) => !!session.credentials);
  const { data, previousData } = useOperatorQuery({
    variables: { operatorId: operatorId || '' },
    skip: !operatorId || !loggedIn,
  });
  // Keep the previous operator's colours while the next one loads rather than flashing the defaults
  const operator = (data ?? previousData)?.operator;
  const overridePrimary = useThemeOverrides((overrides) => overrides.primary);

  // The preview has been saved once Apollo holds the same colour
  React.useEffect(() => {
    if (overridePrimary && overridePrimary === operator?.primaryColor) {
      useThemeOverrides.getState().setPrimary(null);
    }
  }, [overridePrimary, operator?.primaryColor]);

  const primary = overridePrimary || operator?.primaryColor;
  const accent = operator?.secondaryColor;

  return React.useMemo(() => {
    const theme = createAppTheme(isDark, { primary, accent });
    return { theme, palette: createPalette(theme), isDark };
  }, [isDark, primary, accent]);
}

/** The Paper/React Navigation theme, the palette (primary and accent expanded into shades) and `isDark`. */
export function useAppTheme(): AppThemeState {
  return React.useContext(AppThemeContext);
}

export default useAppTheme;
