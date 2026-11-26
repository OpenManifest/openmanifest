/** The moments of a load the person who pressed the button feels: the call, the departure, the landing */
export type HapticEvent = 'call' | 'depart' | 'land';

/** Which feedback of `expo-haptics` an event plays (kept free of the module, so the web bundle does not load it) */
export type HapticFeedback =
  { kind: 'notification'; type: 'success' } | { kind: 'impact'; style: 'medium' };

/** A call is a firm tap, a departure and a landing are a success */
export function hapticOf(event: HapticEvent): HapticFeedback {
  if (event === 'call') return { kind: 'impact', style: 'medium' };
  return { kind: 'notification', type: 'success' };
}
