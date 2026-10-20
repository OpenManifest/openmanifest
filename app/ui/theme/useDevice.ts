import * as React from 'react';
import { Platform } from 'react-native';
import useBreakpoint, { Breakpoint } from 'app/components/layout/useBreakpoint';
import type { Density } from '../tokens';

export type Pointer = 'coarse' | 'fine';

export type Device = {
  breakpoint: Breakpoint;
  pointer: Pointer;
  density: Density;
};

const COARSE_QUERY = '(pointer: coarse)';

const canMatchMedia = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/** Native devices are touch; on the web the primary pointer decides. */
function readPointer(): Pointer {
  if (!canMatchMedia()) return 'coarse';
  return window.matchMedia(COARSE_QUERY).matches ? 'coarse' : 'fine';
}

/**
 * Touch gets the regular rows. A mouse and keyboard on a wide window gets compact rows; elsewhere regular. Comfortable
 * rows are only chosen by the user (Account, later).
 */
export function densityOf(breakpoint: Breakpoint, pointer: Pointer): Density {
  return pointer === 'fine' && breakpoint === 'expanded' ? 'compact' : 'regular';
}

/** The primary pointer; follows a mouse being plugged into a tablet on the web. */
export function usePointer(): Pointer {
  const [pointer, setPointer] = React.useState<Pointer>(readPointer);

  React.useEffect(() => {
    if (!canMatchMedia()) return undefined;
    const query = window.matchMedia(COARSE_QUERY);
    const update = () => setPointer(query.matches ? 'coarse' : 'fine');
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return pointer;
}

/** The window width class, the primary pointer and the row density that follows from them. */
export default function useDevice(densityOverride?: Density | null): Device {
  const breakpoint = useBreakpoint();
  const pointer = usePointer();

  return React.useMemo(
    () => ({ breakpoint, pointer, density: densityOverride ?? densityOf(breakpoint, pointer) }),
    [breakpoint, pointer, densityOverride]
  );
}
