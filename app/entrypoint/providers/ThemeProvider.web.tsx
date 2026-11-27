import { ThemeProvider } from '@mui/material';
import { Theme, createTheme } from '@mui/material/styles';
import * as React from 'react';
import { AppThemeProvider, useAppTheme } from 'app/theme';
import I18nProvider from 'app/i18n/I18nProvider';

function MuiBridge(props: { children: React.ReactNode }) {
  const { palette, isDark } = useAppTheme();
  const muiTheme: Theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: palette.primary,
          secondary: palette.accent,
          background: {
            default: palette.background,
            paper: palette.surface,
          },
          mode: isDark ? 'dark' : 'light',
          common: {
            white: palette.background,
            black: palette.onSurface,
          },
        },
      }),
    [
      palette.accent,
      palette.background,
      palette.onSurface,
      palette.primary,
      palette.surface,
      isDark,
    ]
  );

  return <ThemeProvider theme={muiTheme}>{props.children}</ThemeProvider>;
}

function Content(props: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <I18nProvider>
        <MuiBridge>{props.children}</MuiBridge>
      </I18nProvider>
    </AppThemeProvider>
  );
}
export default Content;
