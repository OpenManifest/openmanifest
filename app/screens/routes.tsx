import { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import * as Linking from 'expo-linking';
/* eslint-disable no-nested-ternary */
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import NotFoundScreen from './NotFoundScreen';
import { useAppSelector } from '../state/store';

import Limbo, { LimboRoutes } from './limbo/routes';
import Unauthenticated, { UnauthenticatedRoutes } from './unauthenticated/routes';
import Wizards, { WizardRoutes } from './wizards/routes';
import LeftDrawer, { LeftDrawerRoutes } from './drawers/UserDrawer';

export const options: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [
    Linking.makeUrl('/'),
    'https://www.openmanifest.org',
    'https://staging.openmanifest.org',
    'openmanifest://',
    'http://localhost:19006',
  ],
  config: {
    screens: {
      Authenticated: {
        screens: {
          LeftDrawer: {
            screens: {
              Overview: {
                screens: {
                  DashboardScreen: '/dropzone/dashboard',
                  OverviewScreen: '/overview',
                },
              },
              Manifest: {
                screens: {
                  ManifestScreen: '/dropzone/manifest',
                  DashboardScreen: '/dropzone/overview',
                  User: {
                    screens: {
                      EquipmentScreen: '/dropzone/manifest/users/:userId/equipment/',
                      OrderReceiptScreen:
                        '/dropzone/manifest/users/:userId/orders/:orderId/receipts',
                      ProfileScreen: '/dropzone/manifest/users/:userId',
                      OrdersScreen: '/dropzone/manifest/users/:userId/orders',
                      RigInspectionScreen:
                        '/dropzone/manifest/users/:dropzoneUserId/rig/:rigId/inspection',
                      UserListScreen: '/dropzone/manifest/users',
                    },
                  },
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
      Limbo: {
        screens: {
          DropzoneSelectScreen: '/select-dropzone',
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
          DropzoneWizardScreen: '/setup',
          User: {
            screens: {
              UserListScreen: '/modal/users',
              ProfileScreen: '/modal/user/:userId',
              EquipmentScreen: '/modal/user/:userId/equipment',
              OrdersScreen: '/modal/user/:userId/transactions',
              OrderReceiptScreen: '/modal/user/:userId/transactions/:orderId/receipt',
              RigInspectionScreen: '/modal/user/:dropzoneUserId/rig-inspection/:rig',
            },
          },
        },
      },
      // FIXME: Remove in release
      // NotFound: '*',
    },
  },
};

export type Routes = {
  Authenticated: NavigatorScreenParams<LeftDrawerRoutes>;
  Unauthenticated: NavigatorScreenParams<UnauthenticatedRoutes>;
  Limbo: NavigatorScreenParams<LimboRoutes>;
  Wizards: NavigatorScreenParams<WizardRoutes>;
  NotFound: undefined;
};

const Stack = createStackNavigator<Routes>();
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends Routes {}
  }
}

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
          <Stack.Screen name="Authenticated" component={LeftDrawer} />
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
