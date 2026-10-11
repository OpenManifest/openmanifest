import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const PREFERENCES_STORAGE_KEY = 'openmanifest.preferences.v1';

export type ColorSchemePreference = 'system' | 'light' | 'dark';

type PreferencesState = {
  colorScheme: ColorSchemePreference;
  setColorScheme(colorScheme: ColorSchemePreference): void;
  hydrated: boolean;
};

/** Device-level preferences; they survive logging out. */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),
      hydrated: false,
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      // AsyncStorage is backed by localStorage on web
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ colorScheme }) => ({ colorScheme }),
      onRehydrateStorage: () => () => {
        // Deferred because `usePreferences` is not assigned yet when a synchronous storage finishes during `create`
        Promise.resolve().then(() => usePreferences.setState({ hydrated: true }));
      },
    }
  )
);
