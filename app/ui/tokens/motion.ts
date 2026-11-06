/** Durations in ms. `highlight` is how long a changed row stays marked. */
export const motion = { fast: 120, base: 200, slow: 300, highlight: 600 } as const;

export type MotionKey = keyof typeof motion;
