/** Whole seconds from `now` to `end`, never below zero (both in milliseconds) */
export function secondsLeft(endMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((endMs - nowMs) / 1000));
}

/** "09:30", or "1:09:30" from an hour up */
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}

/** The minutes a screen reader is told: rounded up, so "1 minute left" lasts until the end */
export function announcedMinutes(totalSeconds: number): number {
  return Math.ceil(totalSeconds / 60);
}
