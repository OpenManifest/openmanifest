import type { HapticEvent } from './hapticEvents';

/** The web has no haptics worth the name (phones' vibration is not the same feel): nothing happens */
export function haptic(_event: HapticEvent) {}

export type { HapticEvent } from './hapticEvents';
