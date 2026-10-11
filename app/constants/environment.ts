import Constants from 'expo-constants';

/**
 * The deployment environment (local, development, staging or production), set from EXPO_ENV by `app.config.ts`
 * at build time. Metro only inlines `EXPO_PUBLIC_*` variables into app code, so read the value from the manifest.
 */
const environment: string = Constants.expoConfig?.extra?.environment ?? 'production';

export default environment;
