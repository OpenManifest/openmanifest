import type { Breakpoint } from 'app/components/layout/useBreakpoint';
import {
  colour,
  deriveBrand,
  density,
  elevation,
  motion,
  radius,
  space,
  type,
  type ColourTokens,
  type Density,
  type Scheme,
} from '../tokens';
import type { Pointer } from './useDevice';

/** Everything a component styles itself with. Built by `createTheme`; read with `useTheme()` or `useStyles()`. */
export type Theme = {
  scheme: Scheme;
  isDark: boolean;
  colour: ColourTokens;
  type: typeof type;
  space: typeof space;
  radius: typeof radius;
  elevation: typeof elevation;
  density: {
    name: Density;
    /** Height of a list row at the current density */
    row: number;
    /** Smallest size of anything tappable on this platform */
    touchTarget: number;
  };
  motion: typeof motion;
  breakpoint: Breakpoint;
  pointer: Pointer;
};

export type ThemeInput = {
  scheme: Scheme;
  /** The operator's brand colour; the default brand of the scheme when absent or not a colour */
  brand?: string | null;
  breakpoint?: Breakpoint;
  pointer?: Pointer;
  density?: Density;
  /** Minimum touch target of the platform (44 on iOS, 48 on Android and the web) */
  platform?: 'ios' | 'android' | 'web' | string;
};

export function createTheme({
  scheme,
  brand,
  breakpoint = 'compact',
  pointer = 'coarse',
  density: densityName = 'regular',
  platform = 'android',
}: ThemeInput): Theme {
  const base = colour[scheme];
  const derived = brand ? deriveBrand(brand, scheme) : null;

  return {
    scheme,
    isDark: scheme === 'dark',
    colour: derived ? { ...base, ...derived } : base,
    type,
    space,
    radius,
    elevation,
    density: {
      name: densityName,
      row: density.row[densityName],
      touchTarget: platform === 'ios' ? density.touchTarget.ios : density.touchTarget.android,
    },
    motion,
    breakpoint,
    pointer,
  };
}
