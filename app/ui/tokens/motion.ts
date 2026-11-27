/** Durations in ms. `highlight` is how long a changed row stays marked. */
export const motion = { fast: 120, base: 200, slow: 300, highlight: 600 } as const;

export type MotionKey = keyof typeof motion;

/** The standard easing of every transition: the control points of a cubic Bézier (CSS `cubic-bezier(…)`) */
export const easing = { standard: [0.2, 0, 0, 1] } as const;
