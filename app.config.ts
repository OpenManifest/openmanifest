import { ExpoConfig, ConfigContext } from '@expo/config';
import 'dotenv/config';

const BACKEND_ENVIRONMENTS = {
  development: 'http://127.0.0.1:5000/graphql',
  staging: 'https://devapi.openmanifest.org/graphql',
  default: 'https://devapi.openmanifest.org/graphql',
  production: 'https://api.openmanifest.org/graphql',
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = process.env.EXPO_ENV;

  const conf = {
    ...config,
    name: 'OpenManifest',
    slug: 'openmanifest',
    hooks: {
      postPublish: [
        {
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: 'danger-technology',
            project: 'openmanifest',
            authToken: process.env.SENTRY_API_KEY,
          },
        },
      ],
    },

    // All values in extra will be passed to your app.
    extra: {
      url: BACKEND_ENVIRONMENTS[process.env.EXPO_ENV],
      urls: BACKEND_ENVIRONMENTS,
      environment: process.env.EXPO_ENV,
      googleMapsAndroid: process.env.GOOGLE_MAPS_ANDROID,
      googleMapsIos: process.env.GOOGLE_MAPS_IOS,
      googleMapsWeb: process.env.GOOGLE_MAPS_WEB,
      "eas": {
        "projectId": "1d8fa34d-2ff8-4095-ab49-29a426117a8c"
      }
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios.config,
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android.config,
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID,
        },
      },
    },
  };
  // console.log(conf);
  return conf;
};
