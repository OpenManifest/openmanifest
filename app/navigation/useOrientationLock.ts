import * as React from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as ScreenOrientation from 'expo-screen-orientation';

/** Phones stay in portrait; tablets rotate (the app config allows every orientation). */
export default function useOrientationLock() {
  React.useEffect(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        const type = await Device.getDeviceTypeAsync();
        if (type === Device.DeviceType.TABLET) {
          await ScreenOrientation.unlockAsync();
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch {
        // The platform refused: leave the orientation as it is
      }
    })();
  }, []);
}
