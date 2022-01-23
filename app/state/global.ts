import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { Theme } from 'react-native-paper/lib/typescript/types';
import color from 'color';
import { primaryColor } from 'app/constants/Colors';
import { DropzoneExtensiveFragment, UserDetailedFragment } from '../api/operations';
import { Credential } from '../api/schema';

const CombinedDefaultTheme: Theme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  fonts: {
    light: { fontFamily: 'Roboto_300Light', fontWeight: '300' },
    thin: { fontFamily: 'Roboto_100Thin', fontWeight: '100' },
    medium: { fontFamily: 'Roboto_500Medium', fontWeight: '500' },
    regular: { fontFamily: 'Roboto_400Regular', fontWeight: '400' },
  },
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,

    primary: primaryColor,
  },
};
const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  fonts: {
    light: { fontFamily: 'Roboto_300Light', fontWeight: '300' as const },
    thin: { fontFamily: 'Roboto_100Thin', fontWeight: '100' as const },
    medium: { fontFamily: 'Roboto_500Medium', fontWeight: '500' as const },
    regular: { fontFamily: 'Roboto_400Regular', fontWeight: '400' as const },
  },
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: primaryColor,
  },
};

interface IGlobalState {
  currentDropzoneId: number | null;
  // @deprecated
  currentUser: UserDetailedFragment | null;
  credentials: Credential | null;
  // @deprecated
  currentDropzone: DropzoneExtensiveFragment | null;
  permissions: string[];

  expoPushToken: string | null;
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
  currentDropzoneId: null,
  permissions: [],
  credentials: null,
  expoPushToken: null,
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
    setCredentials: (state: IGlobalState, action: PayloadAction<Credential>) => {
      state.credentials = action.payload;
    },
    setUser: (state: IGlobalState, action: PayloadAction<UserDetailedFragment>) => {
      state.currentUser = action.payload;
    },
    setExpoPushToken: (state: IGlobalState, action: PayloadAction<string>) => {
      state.expoPushToken = action.payload;
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
      state.currentDropzoneId = action.payload?.id ? Number(action.payload?.id) : null;

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
    toggleDarkMode: (state: IGlobalState) => {
      state.isDarkMode = !state.isDarkMode;
      state.theme = state.isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

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
    logout: (state: IGlobalState) => {
      Object.keys(initialState).forEach((key) => {
        const payloadKey = key as keyof Required<IGlobalState>;
        if (payloadKey in state) {
          const typedKey = payloadKey as keyof typeof initialState;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore We know this is right
          state[payloadKey] = initialState[typedKey];
        }
      });
    },
  },
});
