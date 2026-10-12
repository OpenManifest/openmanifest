import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const PREFERENCES_STORAGE_KEY = 'openmanifest.preferences.v1';

export type ColorSchemePreference = 'system' | 'light' | 'dark';
/** `auto` follows the window and the pointer (app/ui/theme/useDevice) */
export type DensityPreference = 'auto' | 'compact' | 'regular' | 'comfortable';

type PreferencesState = {
  colorScheme: ColorSchemePreference;
  setColorScheme(colorScheme: ColorSchemePreference): void;
  density: DensityPreference;
  setDensity(density: DensityPreference): void;
  hydrated: boolean;
};

/** Device-level preferences; they survive logging out. */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),
      density: 'auto',
      setDensity: (density) => set({ density }),
      hydrated: false,
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      // AsyncStorage is backed by localStorage on web
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ colorScheme, density }) => ({ colorScheme, density }),
      onRehydrateStorage: () => () => {
        // Deferred because `usePreferences` is not assigned yet when a synchronous storage finishes during `create`
        Promise.resolve().then(() => usePreferences.setState({ hydrated: true }));
      },
    }
  )
);
