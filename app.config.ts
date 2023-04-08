import { ExpoConfig, ConfigContext } from '@expo/config';
import 'dotenv/config';
import { APP_NAME, APP_VERSION, BUILD_NUMBER, BUILD_VERSION, ENDPOINTS, getEndpoint } from './build/constants';

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = process.env.EXPO_ENV;

  const appSignalApiKey = {
    development: process.env.APPSIGNAL_DEVELOPMENT_API_KEY,
    staging: process.env.APPSIGNAL_STAGING_API_KEY,
    production: process.env.APPSIGNAL_PRODUCTION_API_KEY,
  };

  const conf: ExpoConfig = {
    ...config,
    name: APP_NAME,
    version: APP_VERSION,
    slug: 'openmanifest',
    plugins: [
      [
        "expo-facebook", {
          userTrackingPermission: false
        }
      ]
    ],

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
      "eas": {
        "projectId": "1d8fa34d-2ff8-4095-ab49-29a426117a8c"
      },
      appSignalApiKey: appSignalApiKey[environment],
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios.config,
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS,
      },
      buildNumber: BUILD_VERSION
    },
    android: {
      ...config.android,
      config: {
        ...config.android.config,
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID,
        },
      },
      versionCode: BUILD_NUMBER
    },
  };
  // console.log(conf);
  return conf;
};
