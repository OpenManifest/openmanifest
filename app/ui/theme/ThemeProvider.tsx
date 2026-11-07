import * as React from 'react';
import { Platform } from 'react-native';
import type { Density, Scheme } from '../tokens';
import { createTheme, Theme } from './theme';
import useDevice from './useDevice';

const ThemeContext = React.createContext<Theme>(
  createTheme({ scheme: 'light', platform: Platform.OS })
);

type ThemeProviderProps = {
  scheme: Scheme;
  /** The current operator's brand colour */
  brand?: string | null;
  /** Row density chosen by the user; otherwise it follows the window and the pointer */
  density?: Density | null;
  children: React.ReactNode;
};

/** Provides the design tokens, with the operator's brand shades for the scheme and the device's breakpoint and density. */
export default function ThemeProvider({ scheme, brand, density, children }: ThemeProviderProps) {
  const device = useDevice(density);
  const theme = React.useMemo(
    () => createTheme({ scheme, brand, ...device, platform: Platform.OS }),
    [scheme, brand, device]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** The theme of the nearest `ThemeProvider` (the light default brand outside one). */
export function useTheme(): Theme {
  return React.useContext(ThemeContext);
}
