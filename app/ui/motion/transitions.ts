import { easing, motion } from '../tokens/motion';

export type OverlayKind = 'sheet' | 'dialog' | 'panel';

export type OverlayTransition = {
  /** How long it takes to come in, in ms; 0 when the system asks for less motion */
  duration: number;
  /** The `animationType` of a native `Modal` */
  modal: 'none' | 'slide' | 'fade';
};

/**
 * How an overlay comes in: a sheet and a side panel slide in (`motion.slow`), a dialog fades in (`motion.base`); with
 * reduced motion they appear at once.
 */
export function overlayTransition(kind: OverlayKind, reduce: boolean): OverlayTransition {
  if (reduce) return { duration: 0, modal: 'none' };
  if (kind === 'dialog') return { duration: motion.base, modal: 'fade' };
  return { duration: motion.slow, modal: 'slide' };
}

/** The standard easing as CSS */
export const cssEasing = `cubic-bezier(${easing.standard.join(', ')})`;

/** A duration in ms as CSS */
export const cssDuration = (ms: number) => `${ms}ms`;
