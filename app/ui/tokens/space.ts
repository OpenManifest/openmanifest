/** Spacing scale in dp; use these for padding, margin and gap. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export type SpaceKey = keyof typeof space;
