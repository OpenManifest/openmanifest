import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const options: LinkingOptions = {
  prefixes: [
    Linking.makeUrl('/'),
    'https://openmanifest.org',
    'https://staging.openmanifest.org',
    'openmanifest://',
    'http://localhost:19006',
  ],
  config: {
    screens: {
      confirm: {
        path: '/confirm',
      },
      ChangePasswordScreen: {
        path: '/change-password',
      },
      Authenticated: {
        screens: {
          HomeScreen: '/home',
          LoadScreen: '/load/:load_id',
          PackingScreen: '/packing',
          ProfileScreen: '/user/:id',
          SetupScreen: '/dropzone/setup',
        },
      },
      Limbo: {
        screens: {
          DropzonesScreen: '/dropzones',
          CreateDropzoneScreen: '/dropzone/create',
        },
      },
      Unauthenticated: {
        screens: {
          LoginScreen: '/login',
          SignUpScreen: '/signup',
        },
      },
      // FIXME: Remove in release
      // NotFound: '*',
    },
  },
};

export default options;
