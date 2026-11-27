import * as Haptics from 'expo-haptics';
import { hapticOf, type HapticEvent } from './hapticEvents';

/** A tap of the device (native only, `haptics.web.ts` does nothing) when a load is called, departs or lands */
export function haptic(event: HapticEvent) {
  const feedback = hapticOf(event);
  const done =
    feedback.kind === 'notification'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // A device without a haptic engine, or with haptics off, says no: that is fine
  done.catch(() => undefined);
}

export type { HapticEvent } from './hapticEvents';
