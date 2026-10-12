/** Row heights in dp and the smallest touch target per platform. */
export const density = {
  row: { compact: 40, regular: 48, comfortable: 56 },
  touchTarget: { ios: 44, android: 48 },
} as const;

export type Density = keyof typeof density.row;
