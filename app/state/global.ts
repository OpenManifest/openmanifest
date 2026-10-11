import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { MD2DarkTheme, MD2LightTheme, MD2Theme } from 'react-native-paper';
import color from 'color';
import { primaryColor } from 'app/constants/Colors';
import merge from 'lodash/merge';
import { DropzoneExtensiveFragment, UserDetailedFragment } from '../api/operations';

/**
 * One theme object serves react-native-paper (Material Design 2, so visuals stay close to Paper 4) and
 * React Navigation, which read different `colors` and `fonts` keys from it.
 */
export type AppTheme = Omit<MD2Theme, 'colors' | 'fonts'> & {
  colors: MD2Theme['colors'] & NavigationTheme['colors'];
  fonts: MD2Theme['fonts'] & NavigationTheme['fonts'];
};

const fonts: AppTheme['fonts'] = {
  light: { fontFamily: 'Roboto_300Light', fontWeight: '300' },
  thin: { fontFamily: 'Roboto_100Thin', fontWeight: '100' },
  medium: { fontFamily: 'Roboto_500Medium', fontWeight: '500' },
  regular: { fontFamily: 'Roboto_400Regular', fontWeight: '400' },
  bold: { fontFamily: 'Roboto_700Bold', fontWeight: '700' },
  heavy: { fontFamily: 'Roboto_700Bold', fontWeight: '700' },
};

const CombinedDefaultTheme: AppTheme = {
  ...MD2LightTheme,
  ...NavigationDefaultTheme,
  fonts,
  colors: {
    ...MD2LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: primaryColor,
  },
};
const CombinedDarkTheme: AppTheme = {
  ...MD2DarkTheme,
  ...NavigationDarkTheme,
  fonts,
  colors: {
    ...MD2DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: primaryColor,
  },
};

interface IGlobalState {
  authenticated: boolean;
  // @deprecated
  currentUser: UserDetailedFragment | null;
  // @deprecated
  currentDropzone: DropzoneExtensiveFragment | null;
  permissions: string[];

  palette: Omit<typeof CombinedDefaultTheme.colors, 'primary' | 'accent'> & {
    primary: {
      light: string;
      main: string;
      dark: string;
    };
    accent: {
      light: string;
      main: string;
      dark: string;
    };
  };

  theme: typeof CombinedDarkTheme | typeof CombinedDefaultTheme;
  isDarkMode: boolean;
}

export const initialState: IGlobalState = {
  currentUser: null,
  currentDropzone: null,
  permissions: [],
  authenticated: false,
  theme: CombinedDefaultTheme,
  palette: {
    ...CombinedDefaultTheme.colors,
    primary: {
      main: '#FF1414',
      dark: '#991414',
      light: '#FFAAAA',
    },
    accent: {
      main: '#FFFFFF',
      dark: '#FFFFFF',
      light: '#FFFFFF',
    },
  },
  isDarkMode: false,
};
export default createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAuthenticated: (state: IGlobalState, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
    },
    setUser: (state: IGlobalState, action: PayloadAction<UserDetailedFragment>) => {
      state.currentUser = action.payload;
    },
    setPermissions: (state: IGlobalState, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    setPrimaryColor: (state: IGlobalState, action: PayloadAction<string>) => {
      state.theme.colors.primary = action.payload;
      state.palette = {
        ...state.theme.colors,
        primary: {
          dark: color(state.theme.colors.primary).darken(0.4).hex(),
          main: state.theme.colors.primary,
          light: color(state.theme.colors.primary).lighten(0.6).hex(),
        },
        accent: {
          dark: color(state.theme.colors.accent).darken(0.4).hex(),
          main: state.theme.colors.accent,
          light: color(state.theme.colors.accent).lighten(0.6).hex(),
        },
      };
    },
    setAccentColor: (state: IGlobalState, action: PayloadAction<string>) => {
      state.theme.colors.accent = action.payload;
      state.palette = {
        ...state.theme.colors,
        primary: {
          dark: color(state.theme.colors.primary).darken(0.4).hex(),
          main: state.theme.colors.primary,
          light: color(state.theme.colors.primary).lighten(0.6).hex(),
        },
        accent: {
          dark: color(state.theme.colors.accent).darken(0.4).hex(),
          main: state.theme.colors.accent,
          light: color(state.theme.colors.accent).lighten(0.8).hex(),
        },
      };
    },
    setDropzone: (state: IGlobalState, action: PayloadAction<DropzoneExtensiveFragment | null>) => {
      state.currentDropzone = action.payload;
      console.debug('Setting id', action?.payload?.id);

      if (state.currentDropzone?.primaryColor) {
        state.theme.colors.primary = state.currentDropzone?.primaryColor;
      }

      if (state.currentDropzone?.secondaryColor) {
        state.theme.colors.accent = state.currentDropzone?.secondaryColor;
      }
      state.palette = {
        ...state.theme.colors,
        primary: {
          dark: color(state.theme.colors.primary).darken(0.4).hex(),
          main: state.theme.colors.primary,
          light: color(state.theme.colors.primary).lighten(0.6).hex(),
        },
        accent: {
          dark: color(state.theme.colors.accent).darken(0.4).hex(),
          main: state.theme.colors.accent,
          light: color(state.theme.colors.accent).lighten(0.6).hex(),
        },
      };
    },
    setAppearance: (state: IGlobalState, action: PayloadAction<'light' | 'dark'>): IGlobalState => {
      const current = state.isDarkMode ? 'dark' : 'light';
      state.isDarkMode = action.payload === 'dark';

      console.log('Setting appearance to', action.payload);
      if (current === action.payload) {
        return state;
      }
      state.theme = merge(
        {},
        action.payload === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme,
        {
          colors: {
            primary: state.currentDropzone?.primaryColor || CombinedDarkTheme.colors.primary,
            accent: state.currentDropzone?.secondaryColor || CombinedDarkTheme.colors.accent,
          },
        }
      );

      state.palette = {
        ...state.theme.colors,
        primary: {
          dark: color(state.theme.colors.primary).darken(0.4).hex(),
          main: state.theme.colors.primary,
          light: color(state.theme.colors.primary).lighten(0.6).hex(),
        },
        accent: {
          dark: color(state.theme.colors.accent).darken(0.4).hex(),
          main: state.theme.colors.accent,
          light: color(state.theme.colors.accent).lighten(0.6).hex(),
        },
      };
      return state;
    },
    logout: (state: IGlobalState) => {
      console.debug('Logout called?');
      Object.keys(initialState).forEach((key) => {
        const payloadKey = key as keyof Required<IGlobalState>;
        if (payloadKey in state) {
          const typedKey = payloadKey as keyof typeof initialState;

          // @ts-ignore We know this is right
          state[payloadKey] = initialState[typedKey];
        }
      });
    },
  },
});
