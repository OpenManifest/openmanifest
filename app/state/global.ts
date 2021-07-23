import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { Theme } from 'react-native-paper/lib/typescript/types';
import { Credential, User, Dropzone } from '../api/schema';

const CombinedDefaultTheme: Theme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  roundness: 16,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#333333',
  },
};
const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  roundness: 16,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#333333',
  },
};

interface IGlobalState {
  currentDropzoneId: number | null;
  // @deprecated
  currentUser: User | null;
  credentials: Credential | null;
  // @deprecated
  currentDropzone: Dropzone | null;
  permissions: string[];

  expoPushToken: string | null;

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
  isDarkMode: false,
};
export default createSlice({
  name: 'global',
  initialState,
  reducers: {
    setCredentials: (state: IGlobalState, action: PayloadAction<Credential>) => {
      state.credentials = action.payload;
    },
    setUser: (state: IGlobalState, action: PayloadAction<User>) => {
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
    },
    setAccentColor: (state: IGlobalState, action: PayloadAction<string>) => {
      state.theme.colors.accent = action.payload;
    },
    setDropzone: (state: IGlobalState, action: PayloadAction<Dropzone | null>) => {
      state.currentDropzone = action.payload;
      state.currentDropzoneId = action.payload?.id ? Number(action.payload?.id) : null;

      if (state.currentDropzone?.primaryColor) {
        state.theme.colors.primary = state.currentDropzone?.primaryColor;
      }

      if (state.currentDropzone?.secondaryColor) {
        state.theme.colors.accent = state.currentDropzone?.secondaryColor;
      }
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
