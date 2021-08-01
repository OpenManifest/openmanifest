import * as Linking from 'expo-linking';

export default {
  prefixes: [
    Linking.makeUrl('/'),
    'https://openmanifest.org',
    'openmanifest://',
    'http://localhost:19006',
  ],
  config: {
    screens: {
      confirm: {
        path: '/confirm',
        params: {
          account_confirmation_success: undefined,
        },
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
