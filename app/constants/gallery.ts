import { Platform } from 'react-native';
import environment from './environment';

/**
 * Whether the dev pages (`/__gallery`, `/__forms`, `/__overlays`) are part of this build: on the web in local and
 * development builds, and in any other web build made with `EXPO_PUBLIC_GALLERY=1` (the CI export). Never in a
 * production build unless that variable says so, and never on native.
 */
export const GALLERY_ENABLED =
  Platform.OS === 'web' &&
  (environment === 'local' ||
    environment === 'development' ||
    process.env.EXPO_PUBLIC_GALLERY === '1');
