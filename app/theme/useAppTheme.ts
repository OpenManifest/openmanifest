import * as React from 'react';
import { useDropzoneQuery } from 'app/api/reflection';
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
 * Derives the theme from the colour scheme preference (or the device), the current dropzone's brand colours (Apollo)
 * and any preview overrides. Called once, by `AppThemeProvider`; components read the result with `useAppTheme()`.
 */
export function useCreateAppTheme(): AppThemeState {
  const preference = usePreferences((state) => state.colorScheme);
  const deviceScheme = useColorScheme();
  const isDark = preference === 'system' ? deviceScheme === 'dark' : preference === 'dark';

  const dropzoneId = useSession((session) => session.currentDropzoneId);
  const loggedIn = useSession((session) => !!session.credentials);
  const { data, previousData } = useDropzoneQuery({
    variables: { dropzoneId: dropzoneId || '' },
    skip: !dropzoneId || !loggedIn,
  });
  // Keep the previous dropzone's colours while the next one loads rather than flashing the defaults
  const dropzone = (data ?? previousData)?.dropzone;
  const overridePrimary = useThemeOverrides((overrides) => overrides.primary);

  // The preview has been saved once Apollo holds the same colour
  React.useEffect(() => {
    if (overridePrimary && overridePrimary === dropzone?.primaryColor) {
      useThemeOverrides.getState().setPrimary(null);
    }
  }, [overridePrimary, dropzone?.primaryColor]);

  const primary = overridePrimary || dropzone?.primaryColor;
  const accent = dropzone?.secondaryColor;

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
