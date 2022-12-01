import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export enum ScreenOrientation {
  Landscape = 'LANDSCAPE',
  Portrait = 'PORTRAIT',
}
export default function useDevice() {
  const { width, height } = useWindowDimensions();
  const orientation = useMemo(
    () => (width > height ? ScreenOrientation.Landscape : ScreenOrientation.Portrait),
    [height, width]
  );

  return useMemo(() => ({ width, height, orientation }), [height, orientation, width]);
}
