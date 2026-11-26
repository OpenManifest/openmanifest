export type Elevation = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  /** Android */
  elevation: number;
};

const shadow = (height: number, opacity: number, radius: number, elevation: number): Elevation => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const elevation = {
  none: shadow(0, 0, 0, 0),
  raised: shadow(1, 0.08, 3, 1),
  overlay: shadow(8, 0.16, 16, 8),
};

export type ElevationKey = keyof typeof elevation;
