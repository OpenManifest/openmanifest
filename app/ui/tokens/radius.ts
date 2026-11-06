export const radius = { sm: 4, md: 8, lg: 12, pill: 999 } as const;

export type RadiusKey = keyof typeof radius;
