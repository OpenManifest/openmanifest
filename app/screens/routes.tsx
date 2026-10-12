import { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import NotFoundScreen from './NotFoundScreen';
import { useSession } from '../state';

import Limbo, { LimboRoutes } from './limbo/routes';
import Unauthenticated, { UnauthenticatedRoutes } from './unauthenticated/routes';
import Wizards, { WizardRoutes } from './wizards/routes';
import LeftDrawer, { LeftDrawerRoutes } from './drawers/UserDrawer';

export const options: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [
    Linking.createURL('/'),
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
                  DashboardScreen: '/dashboard',
                  OverviewScreen: '/overview',
                },
              },
              Manifest: {
                screens: {
                  ManifestScreen: '/manifest',
                  User: {
                    screens: {
                      EquipmentScreen: '/manifest/users/:userId/equipment/',
                      OrderReceiptScreen: '/manifest/users/:userId/orders/:orderId/receipts',
                      ProfileScreen: '/manifest/users/:userId',
                      OrdersScreen: '/manifest/users/:userId/orders',
                      RigInspectionScreen: '/manifest/users/:membershipId/rig/:rigId/inspection',
                      UserListScreen: '/manifest/users',
                    },
                  },
                  Configuration: {
                    screens: {
                      TicketTypesScreen: '/configuration/ticket-types',
                      OperatorRigsScreen: '/configuration/rigs',
                      ExtrasScreen: '/ticket-types/extra',
                      DailyLogScreen: '/daily-log',
                      SettingsMenuScreen: '/configuration',
                      VehiclesScreen: '/configuration/vehicles',
                      OperatorSettingsScreen: '/configuration/basic',
                      PermissionScreen: '/configuration/permissions',
                      RigInspectionTemplateScreen: '/configuration/rig-inspection',
                      TransactionsScreen: '/transactions',
                    },
                  },
                  JumpRunScreen: '/weather/jumprun',
                  WeatherConditionsScreen: '/weather',
                  LoadScreen: '/loads/:loadId',
                  WindScreen: '/weather/winds',
                },
              },
              Users: {
                screens: {
                  UserListScreen: '/users',
                  ProfileScreen: '/user/:userId',
                  EquipmentScreen: '/user/:userId/equipment',
                  OrdersScreen: '/user/:userId/transactions',
                  OrderReceiptScreen: '/user/:userId/transactions/:orderId/receipt',
                  RigInspectionScreen: '/user/:membershipId/rig-inspection/:rig',
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
          OperatorSelectScreen: '/operators/select',
        },
      },
      Unauthenticated: {
        screens: {
          LoginScreen: '/login',
          SignUpScreen: '/signup',
        },
      },
      Wizards: {
        screens: {
          ConfirmUserScreen: '/confirm',
          RecoverPasswordScreen: '/recover-password',
          ChangePasswordScreen: '/change-password',
          OperatorWizardScreen: '/setup',
          User: {
            screens: {
              UserListScreen: '/modal/users',
              ProfileScreen: '/modal/user/:userId',
              EquipmentScreen: '/modal/user/:userId/equipment',
              OrdersScreen: '/modal/user/:userId/transactions',
              OrderReceiptScreen: '/modal/user/:userId/transactions/:orderId/receipt',
              RigInspectionScreen: '/modal/user/:membershipId/rig-inspection/:rig',
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
  namespace ReactNavigation {
    // rome-ignore lint/suspicious/noEmptyInterface: Required
    interface RootParamList extends Routes {}
  }
}

export default function RootNavigator() {
  const credentials = useSession((session) => session.credentials);
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      {credentials ? (
        currentOperatorId ? (
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
