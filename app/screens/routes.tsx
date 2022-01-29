import { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import { DropzoneRoutes } from 'app/screens/authenticated/dropzone/routes';
import { UserRoutes } from 'app/screens/authenticated/user/routes';
import * as Linking from 'expo-linking';
/* eslint-disable no-nested-ternary */
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerMenu from 'app/components/drawer/Drawer';

import NotFoundScreen from '../screens/NotFoundScreen';
import { useAppSelector } from '../state/store';

import Authenticated, { AuthenticatedRoutes } from '../screens/authenticated/routes';
import Limbo, { LimboRoutes } from './limbo/routes';
import Unauthenticated, { UnauthenticatedRoutes } from './unauthenticated/routes';

import DropzonesScreen from './limbo/dropzone_select/DropzonesScreen';
import DropzoneSetupScreen from '../screens/authenticated/wizards/dropzone_wizard/DropzoneWizard';
import UserSetupWizard from '../screens/authenticated/wizards/user_wizard/UserWizardScreen';
import ConfirmUserScreen from '../screens/unauthenticated/signup/ConfirmUserScreen';
import ChangePasswordScreen from '../screens/unauthenticated/login/ChangePasswordScreen';


export const options: LinkingOptions<ReactNavigation.RootParamList> = {
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
          Drawer: {
            screens: {
              Manifest: {
                screens: {
                  ManifestScreen: '/home',
                }
              },
              Users: {
                screens: {
                  ProfileScreen: '/user/:id',
                }
              }
            }
          }
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

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Authenticated: NavigatorScreenParams<{ Drawer: NavigatorScreenParams<AuthenticatedRoutes> }>;
      Unauthenticated: NavigatorScreenParams<UnauthenticatedRoutes>;
      Limbo: NavigatorScreenParams<LimboRoutes>;
      DropzoneSetupScreen: undefined;
      UserSetupWizardScreen: undefined;
      confirm: undefined;
      ChangePasswordScreen: undefined;
      DropzonesScreen: undefined;
      Dropzones: undefined;
      NotFound: undefined;
    }
  }
}

export type TRootNavigatorRouteParams = {
  Authenticated: undefined;
  Unauthenticated: undefined;
  // eslint-disable-next-line camelcase
  confirm: { token?: string };
  ChangePasswordScreen: { token?: string };
  Dropzones: undefined;
  DropzonesScreen: undefined;
  DropzoneSetupScreen: undefined;
  UserSetupWizard: undefined;
  NotFound: undefined;
};

export type TDrawerNavigatorRouteParams = {
  Drawer: undefined;
  Profile: undefined;
  Settings: undefined;
};
// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<TRootNavigatorRouteParams>();
const Drawer = createDrawerNavigator<TDrawerNavigatorRouteParams>();

export default function RootNavigator() {
  const globalState = useAppSelector((root) => root.global);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      {globalState.credentials ? (
        globalState.currentDropzone ? (
          <Stack.Screen name="Authenticated">
            {() => (
              <Drawer.Navigator drawerContent={() => <DrawerMenu />} screenOptions={{ drawerType: 'back', headerShown: false }}>
                <Drawer.Screen name="Drawer" component={Authenticated} />
              </Drawer.Navigator>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Dropzones" component={Limbo} />
        )
      ) : (
        <Stack.Screen name="Unauthenticated" component={Unauthenticated} />
      )}
      <Stack.Screen name="DropzoneSetupScreen" component={DropzoneSetupScreen} />
      <Stack.Screen name="UserSetupWizard" component={UserSetupWizard} />
      <Stack.Screen name="confirm" component={ConfirmUserScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="DropzonesScreen" component={DropzonesScreen} />

      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
