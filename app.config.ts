import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';


const BACKEND_ENVIRONMENTS = {
  development: "http://127.0.0.1",
  staging: "https://devapi.openmanifest.org/graphql",
  default: "https://devapi.openmanifest.org/graphql",
  production: "https://api.openmanifest.org/graphql",
};


export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = process.env.EXPO_ENV;


  const conf = {
    ...config,
    name: 'OpenManifest',
    version: '1.0.0',
    slug: 'openmanifest',

    hooks: {
      postPublish: [
        {
          file: "sentry-expo/upload-sourcemaps",
          config: {
            "organization": "danger-technology",
            "project": "openmanifest",
            "authToken": process.env.SENTRY_API_KEY
          }
        }
      ]
    },

    // All values in extra will be passed to your app.
    extra: {
      url: BACKEND_ENVIRONMENTS[process.env.EXPO_ENV],
      urls: BACKEND_ENVIRONMENTS,
      environment: process.env.EXPO_ENV
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
          apiKey: process.env.GOOGLE_MAPS_ANDROID
        }
      }
    }
  };
  // console.log(conf);
  return conf;
};
