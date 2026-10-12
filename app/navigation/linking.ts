import { LinkingOptions, getStateFromPath } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import environment from '../constants/environment';
import { redirectLegacyPath } from './legacyPaths';

// The primitives spike (U0.8) exists on the web outside production only
export const SPIKE_ENABLED = Platform.OS === 'web' && environment !== 'production';

/** The paths of the app: the screens of the tabs, the wizards and the sign-in. */
export const options: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'https://www.openmanifest.org',
    'https://staging.openmanifest.org',
    'openmanifest://',
    'http://localhost:19006',
  ],
  // The old paths of the User stack land on the canonical ones
  getStateFromPath: (path, config) => getStateFromPath(redirectLegacyPath(path), config),
  config: {
    screens: {
      Authenticated: {
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
              RigInspectionScreen: '/user/:membershipId/rig-inspection/:rigId',
            },
          },
          Notifications: {
            screens: {
              NotificationsScreen: '/notifications',
            },
          },
          More: '/more',
          Account: '/account',
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
        },
      },
      ...(SPIKE_ENABLED ? { Overlays: '/__overlays', Forms: '/__forms' } : {}),
      // FIXME: Remove in release
      // NotFound: '*',
    },
  },
};
