import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import color from 'color';
import { Platform } from 'react-native';
import { createTheme } from 'app/ui/theme/theme';

/** The React Navigation theme (headers, tab bars, screen backgrounds), its colours taken from the design tokens */
export type AppTheme = NavigationTheme;

type Shades = { light: string; main: string; dark: string };

/**
 * The colours that the web's MUI bridge and a few gradients read: the brand and the accent expanded into
 * light/main/dark shades, and the surfaces from the tokens. Everything else reads `useTheme()` from `app/ui`.
 */
export type AppPalette = {
  primary: Shades;
  accent: Shades;
  background: string;
  surface: string;
  onSurface: string;
  placeholder: string;
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
}) as string;

const fonts: AppTheme['fonts'] = {
  regular: { fontFamily: systemFamily, fontWeight: '400' },
  medium: { fontFamily: systemFamily, fontWeight: '500' },
  bold: { fontFamily: systemFamily, fontWeight: '700' },
  heavy: { fontFamily: systemFamily, fontWeight: '800' },
};

function tokensFor(isDark: boolean, colors: ThemeColors) {
  return createTheme({ scheme: isDark ? 'dark' : 'light', brand: colors.primary }).colour;
}

/** The navigation theme of a scheme and an operator's brand colour, from the design tokens */
export function createAppTheme(isDark: boolean, colors: ThemeColors = {}): AppTheme {
  const navigation = isDark ? NavigationDarkTheme : NavigationDefaultTheme;
  const colour = tokensFor(isDark, colors);

  return {
    ...navigation,
    fonts,
    colors: {
      ...navigation.colors,
      primary: colour.brand,
      background: colour.app,
      card: colour.surface,
      text: colour.text,
      border: colour.border,
      notification: colour.status.blocked.fg,
    },
  };
}

function shades(main: string): Shades {
  return {
    dark: color(main).darken(0.4).hex(),
    main,
    light: color(main).lighten(0.6).hex(),
  };
}

/** The palette of a scheme and an operator's colours (the accent defaults to the info colour of the tokens) */
export function createPalette(isDark: boolean, colors: ThemeColors = {}): AppPalette {
  const colour = tokensFor(isDark, colors);
  return {
    primary: shades(colour.brand),
    accent: shades(colors.accent || colour.status.info.fg),
    background: colour.app,
    surface: colour.surface,
    onSurface: colour.text,
    placeholder: colour.textMuted,
  };
}
