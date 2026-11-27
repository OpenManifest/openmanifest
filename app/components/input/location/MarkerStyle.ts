import { useTheme } from 'app/ui';

/** The look of the pin and its coordinates over a satellite map: the brand colour with a halo, so it shows on any imagery */
export default function useMarkerStyle() {
  const { colour, space } = useTheme();

  return {
    pin: {
      color: colour.brand,
      textShadowColor: colour.surface,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: space.sm,
      zIndex: 10,
    },
    label: {
      color: colour.brand,
      textShadowColor: colour.surface,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: space.sm,
    },
  } as const;
}
