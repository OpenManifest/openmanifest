import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { MD2DarkTheme, MD2LightTheme, MD2Theme } from 'react-native-paper';
import color from 'color';
import { primaryColor } from 'app/constants/Colors';

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
  /** Dropzone brand colours; the defaults apply when absent */
  primary?: string | null;
  accent?: string | null;
};

const fonts: AppTheme['fonts'] = {
  light: { fontFamily: 'Roboto_300Light', fontWeight: '300' },
  thin: { fontFamily: 'Roboto_100Thin', fontWeight: '100' },
  medium: { fontFamily: 'Roboto_500Medium', fontWeight: '500' },
  regular: { fontFamily: 'Roboto_400Regular', fontWeight: '400' },
  bold: { fontFamily: 'Roboto_700Bold', fontWeight: '700' },
  heavy: { fontFamily: 'Roboto_700Bold', fontWeight: '700' },
};

const lightTheme: AppTheme = {
  ...MD2LightTheme,
  ...NavigationDefaultTheme,
  fonts,
  colors: {
    ...MD2LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: primaryColor,
  },
};

const darkTheme: AppTheme = {
  ...MD2DarkTheme,
  ...NavigationDarkTheme,
  fonts,
  colors: {
    ...MD2DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: primaryColor,
  },
};

export function createAppTheme(isDark: boolean, colors: ThemeColors = {}): AppTheme {
  const base = isDark ? darkTheme : lightTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary || base.colors.primary,
      accent: colors.accent || base.colors.accent,
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

export function createPalette(theme: AppTheme): AppPalette {
  return {
    ...theme.colors,
    primary: shades(theme.colors.primary),
    accent: shades(theme.colors.accent),
  };
}
