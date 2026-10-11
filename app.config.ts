import type { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';
import { APP_NAME, APP_VERSION, ENDPOINTS, getEndpoint } from './build/constants';

const EAS_PROJECT_ID = '1d8fa34d-2ff8-4095-ab49-29a426117a8c';
const FACEBOOK_APP_ID = '686479516065674';

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = process.env.EXPO_ENV as 'development' | 'staging' | 'production' | undefined;

  const appSignalApiKey = {
    development: process.env.APPSIGNAL_DEVELOPMENT_API_KEY,
    staging: process.env.APPSIGNAL_STAGING_API_KEY,
    production: process.env.APPSIGNAL_PRODUCTION_API_KEY,
  };

  return {
    ...config,
    name: APP_NAME,
    slug: 'openmanifest',
    // X.Y.0 from package.json. Build numbers (iOS buildNumber, Android versionCode) come from EAS remote versioning.
    version: APP_VERSION,
    runtimeVersion: { policy: 'appVersion' },
    orientation: 'portrait',
    icon: './assets/images/android-icon.png',
    scheme: 'openmanifest',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#111111',
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    assetBundlePatterns: ['**/*'],
    facebookAppId: FACEBOOK_APP_ID,
    facebookDisplayName: 'OpenManifest',
    facebookAutoInitEnabled: true,
    facebookScheme: `fb${FACEBOOK_APP_ID}`,
    plugins: [
      [
        'expo-facebook',
        {
          userTrackingPermission: false,
        },
      ],
    ],
    ios: {
      config: {
        usesNonExemptEncryption: false,
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS,
      },
      usesAppleSignIn: true,
      infoPlist: {
        photosPermission: 'OpenManifest needs access to photos to let you upload avatars',
        fbAppId: FACEBOOK_APP_ID,
        fbAppName: 'OpenManifest',
        fbAppUrl: 'https://www.openmanifest.org',
        facebookScheme: `fb${FACEBOOK_APP_ID}`,
      },
      bundleIdentifier: 'com.dangertechnologies.openmanifest',
      supportsTablet: true,
      icon: './assets/images/logo-black-white-bg.png',
      usesIcloudStorage: true,
      associatedDomains: [
        'applinks:openmanifest.org',
        'applinks:openmanifest.org?mode=developer',
        'applinks:staging.openmanifest.org',
        'applinks:staging.openmanifest.org?mode=developer',
      ],
    },
    android: {
      package: 'com.dangertechnologies.openmanifest',
      // The image picker uses the system photo picker, and POST_NOTIFICATIONS is added by expo-notifications.
      permissions: ['CAMERA', 'NOTIFICATIONS', 'ACCESS_COARSE_LOCATION'],
      adaptiveIcon: {
        foregroundImage: './assets/images/logo-black-white-bg.png',
        backgroundColor: '#F4F4F4',
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID,
        },
      },
      intentFilters: [
        {
          action: 'VIEW',
          data: [
            { scheme: 'https', host: 'openmanifest.org', pathPrefix: '/confirm' },
            { scheme: 'https', host: 'staging.openmanifest.org', pathPrefix: '/confirm' },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
      output: 'single',
    },

    // All values in extra will be passed to your app.
    extra: {
      url: getEndpoint(),
      urls: ENDPOINTS,
      environment: process.env.EXPO_ENV,
      facebookAppId: process.env.FACEBOOK_APP_ID,
      facebookClientToken: process.env.FACEBOOK_CLIENT_TOKEN,
      googleMapsAndroid: process.env.GOOGLE_MAPS_ANDROID,
      googleMapsIos: process.env.GOOGLE_MAPS_IOS,
      googleMapsWeb: process.env.GOOGLE_MAPS_WEB,
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      appSignalApiKey: environment ? appSignalApiKey[environment] : undefined,
    },
  };
};
