import { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import * as Linking from 'expo-linking';
/* eslint-disable no-nested-ternary */
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerMenu from 'app/components/drawer/Drawer';

import NotFoundScreen from './NotFoundScreen';
import { useAppSelector } from '../state/store';

import Authenticated, { AuthenticatedRoutes } from './authenticated/routes';
import Limbo, { LimboRoutes } from './limbo/routes';
import Unauthenticated, { UnauthenticatedRoutes } from './unauthenticated/routes';
import Wizards, { WizardRoutes } from './wizards/routes';

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
      Authenticated: {
        screens: {
          Drawer: {
            screens: {
              Manifest: {
                screens: {
                  ManifestScreen: '/dropzone/manifest',
                  Configuration: {
                    screens: {
                      AircraftScreen: '/dropzone/configuration/aircraft/:planeId',
                      TicketTypesScreen: '/dropzone/configuration/ticket-types',
                      DropzoneRigsScreen: '/dropzone/configuration/rigs',
                      ExtrasScreen: '/dropzone/ticket-types/extra',
                      MasterLogScreen: '/dropzone/master-log',
                      SettingsMenuScreen: '/dropzone/configuration',
                      AircraftsScreen: '/dropzone/configuration/aircrafts',
                      DropzoneSettingsScreen: '/dropzone/configuration/basic',
                      PermissionScreen: '/dropzone/configuration/permissions',
                      RigInspectionTemplateScreen: '/dropzone/configuration/rig-inspection',
                      TransactionsScreen: '/dropzone/transactions',
                    },
                  },
                  JumpRunScreen: '/dropzone/weather/jumprun',
                  WeatherConditionsScreen: '/dropzone/weather',
                  LoadScreen: '/dropzone/load/:loadId',
                  User: {
                    screens: {
                      UserListScreen: '/dropzone/users',
                      ProfileScreen: '/dropzone/user/:userId',
                      EquipmentScreen: '/dropzone/user/:userId/equipment',
                      OrdersScreen: '/dropzone/user/:userId/transactions',
                      OrderReceiptScreen: '/dropzone/user/:userId/transactions/:orderId/receipt',
                      RigInspectionScreen: '/dropzone/user/:dropzoneUserId/rig-inspection/:rig',
                    },
                  },
                  WindScreen: '/dropzone/weather/winds',
                },
              },
              Users: {
                screens: {
                  UserListScreen: '/users',
                  ProfileScreen: '/user/:userId',
                  EquipmentScreen: '/user/:userId/equipment',
                  OrdersScreen: '/user/:userId/transactions',
                  OrderReceiptScreen: '/user/:userId/transactions/:orderId/receipt',
                  RigInspectionScreen: '/user/:dropzoneUserId/rig-inspection/:rig',
                },
              },
              Notifications: {
                screens: {
                  NotificationsScreen: '/notifications',
                },
              },
            },
          },
        },
      },
      Unauthenticated: {
        screens: {
          LoginScreen: '/login',
          SignUpScreen: '/signup',
          SignUpWizard: '/user-setup',
        },
      },
      Wizards: {
        screens: {
          ConfirmUserScreen: '/confirm',
          RecoverPasswordScreen: '/recover-password',
          ChangePasswordScreen: '/change-password',
        },
      },
      // FIXME: Remove in release
      // NotFound: '*',
    },
  },
};

export type Routes = {
  Authenticated: NavigatorScreenParams<{
    Drawer: NavigatorScreenParams<AuthenticatedRoutes>;
  }>;
  Unauthenticated: NavigatorScreenParams<UnauthenticatedRoutes>;
  Limbo: NavigatorScreenParams<LimboRoutes>;
  Wizards: NavigatorScreenParams<WizardRoutes>;
  NotFound: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends Routes {}
  }
}

export type TDrawerNavigatorRouteParams = {
  Drawer: undefined;
};

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<Routes>();
const Drawer = createDrawerNavigator<TDrawerNavigatorRouteParams>();

export default function RootNavigator() {
  const globalState = useAppSelector((root) => root.global);

  const drawerContent = React.useCallback(() => <DrawerMenu />, []);
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
              <Drawer.Navigator
                {...{ drawerContent }}
                screenOptions={{ drawerType: 'back', headerShown: false }}
              >
                <Drawer.Screen name="Drawer" component={Authenticated} />
              </Drawer.Navigator>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Limbo" component={Limbo} />
        )
      ) : (
        <Stack.Screen name="Unauthenticated" component={Unauthenticated} />
      )}
      <Stack.Screen name="Wizards" component={Wizards} />

      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
