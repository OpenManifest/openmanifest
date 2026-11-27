import * as React from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * The system's answer, shared by every hook: asked once, then kept current by the change event, so a component that
 * mounts later (a card that just changed) knows it at its first render instead of animating until it hears back.
 */
let reduceMotion = false;
let asked = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (value === reduceMotion) return;
  reduceMotion = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!asked) {
    asked = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(set)
      .catch(() => undefined);
    AccessibilityInfo.addEventListener?.('reduceMotionChanged', set);
  }
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => reduceMotion;

/**
 * Whether the system asks for less motion (iOS and Android "Reduce motion" / "Remove animations", the browser's
 * `prefers-reduced-motion`). Transitions then appear at once and highlights stand still.
 */
export function useReduceMotion() {
  return React.useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Tests only: forget the answer, so the next hook asks again */
export function resetReduceMotion() {
  reduceMotion = false;
  asked = false;
  listeners.clear();
}
