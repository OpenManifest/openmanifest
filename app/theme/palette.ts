import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { MD2DarkTheme, MD2LightTheme, MD2Theme } from 'react-native-paper';
import color from 'color';
import { Platform } from 'react-native';
import { createTheme } from 'app/ui/theme/theme';

/**
 * One theme object serves react-native-paper (Material Design 2, so visuals stay close to Paper 4) and
 * React Navigation, which read different `colors` and `fonts` keys from it.
 */
export type AppTheme = Omit<MD2Theme, 'colors' | 'fonts'> & {
  colors: MD2Theme['colors'] & NavigationTheme['colors'];
  fonts: MD2Theme['fonts'] & NavigationTheme['fonts'];
};

type Shades = { light: string; main: string; dark: string };

/** The theme colours with `primary` and `accent` expanded into light/main/dark shades */
export type AppPalette = Omit<AppTheme['colors'], 'primary' | 'accent'> & {
  primary: Shades;
  accent: Shades;
};

export type ThemeColors = {
  /** Operator brand colours; the defaults apply when absent */
  primary?: string | null;
  accent?: string | null;
};

/** System fonts on every platform: nothing is downloaded, weights come from `fontWeight`. */
const systemFamily = Platform.select({
  web: 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  ios: 'System',
  default: 'sans-serif',
});

const fonts: AppTheme['fonts'] = {
  light: { fontFamily: systemFamily, fontWeight: '300' },
  thin: { fontFamily: systemFamily, fontWeight: '100' },
  medium: { fontFamily: systemFamily, fontWeight: '500' },
  regular: { fontFamily: systemFamily, fontWeight: '400' },
  bold: { fontFamily: systemFamily, fontWeight: '700' },
  heavy: { fontFamily: systemFamily, fontWeight: '800' },
};

/** The MD2 and Navigation themes of a scheme, with their colours taken from the design tokens */
function themeFor(isDark: boolean, colors: ThemeColors): AppTheme {
  const paper = isDark ? MD2DarkTheme : MD2LightTheme;
  const navigation = isDark ? NavigationDarkTheme : NavigationDefaultTheme;
  const { colour } = createTheme({ scheme: isDark ? 'dark' : 'light', brand: colors.primary });

  return {
    ...paper,
    ...navigation,
    fonts,
    colors: {
      ...paper.colors,
      ...navigation.colors,
      primary: colour.brand,
      accent: colors.accent || paper.colors.accent,
      background: colour.app,
      surface: colour.surface,
      card: colour.surface,
      border: colour.border,
      text: colour.text,
      onSurface: colour.text,
      placeholder: colour.textMuted,
      disabled: color(colour.text).alpha(0.38).rgb().string(),
      error: colour.status.blocked.fg,
    },
  };
}

export function createAppTheme(isDark: boolean, colors: ThemeColors = {}): AppTheme {
  return themeFor(isDark, colors);
}

function shades(main: string): Shades {
  return {
    dark: color(main).darken(0.4).hex(),
    main,
    light: color(main).lighten(0.6).hex(),
  };
}

export function createPalette(theme: AppTheme): AppPalette {
  return {
    ...theme.colors,
    primary: shades(theme.colors.primary),
    accent: shades(theme.colors.accent),
  };
}
