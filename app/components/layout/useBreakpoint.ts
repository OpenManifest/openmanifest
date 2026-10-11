import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'compact' | 'medium' | 'expanded';

export const MEDIUM_MIN_WIDTH = 600;
export const EXPANDED_MIN_WIDTH = 1024;

export function breakpointOf(width: number): Breakpoint {
  if (width < MEDIUM_MIN_WIDTH) {
    return 'compact';
  }
  return width < EXPANDED_MIN_WIDTH ? 'medium' : 'expanded';
}

/** Window width class: phones are `compact`, large phones and small tablets `medium`, tablets and desktops `expanded` */
export default function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();

  return breakpointOf(width);
}
