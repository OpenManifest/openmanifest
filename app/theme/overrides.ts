import { create } from 'zustand';

type ThemeOverrides = {
  primary: string | null;
  setPrimary(color: string | null): void;
};

/**
 * A primary colour that takes precedence over the current dropzone's, so the dropzone form can preview a colour before
 * it is saved. Not persisted. It is dropped as soon as the dropzone's own colour matches it (the save reached Apollo),
 * when another dropzone is selected and on logout.
 */
export const useThemeOverrides = create<ThemeOverrides>((set) => ({
  primary: null,
  setPrimary: (primary) => set({ primary }),
}));
