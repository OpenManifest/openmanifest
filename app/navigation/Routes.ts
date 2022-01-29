import { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import { DropzoneEssentialsFragment, LoadDetailsFragment, OrderEssentialsFragment, RigEssentialsFragment } from 'app/api/operations';
import * as Linking from 'expo-linking';
import { RootStackParamList } from 'types';


const options: LinkingOptions<ReactNavigation.RootParamList> = {
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
    interface RootParamList extends RootStackParamList {
      Authenticated: NavigatorScreenParams<{
        Drawer: NavigatorScreenParams<{
          Manifest: NavigatorScreenParams<{
            DropzoneScreen: undefined
            WeatherConditionsScreen: undefined
            WindScreen: undefined
            ManifestScreen: undefined
            JumpRunScreen: undefined
            LoadScreen: {
              load: LoadDetailsFragment;
            }
            ProfileScreen: undefined
            NotificationsScreen: undefined
            EquipmentScreen: { userId: number };
            TransactionsScreen: { userId: number };
            OrderScreen: { order: OrderEssentialsFragment };
            SettingsScreen: undefined
            UpdateDropzoneScreen: { dropzone: DropzoneEssentialsFragment };
            PlanesScreen: undefined
            TicketTypesScreen: undefined
            UpdateExtraScreen: undefined
            ExtrasScreen: undefined
            RigInspectionTemplateScreen: undefined
            RigInspectionScreen: {
              rig: RigEssentialsFragment;
              dropzoneUserId: number;
            };
            DropzoneRigsScreen: undefined
            DropzoneTransactionsScreen: undefined
            DropzonePermissionScreen: undefined
            DropzoneMasterLogScreen: undefined
          }>;
          Users: NavigatorScreenParams<{
            TransactionsScreen: undefined
            EquipmentScreen: undefined
            RigInspectionScreen: undefined
            UsersScreen: undefined
            UserProfileScreen: { userId: number }
          }>;
          Notifications: undefined
        }>
      }>;
      Unauthenticated: NavigatorScreenParams<{
        LoginScreen: undefined;
        SignUpScreen: undefined;
        SignUpWizard: undefined;
        RecoverPasswordScreen: undefined;
      }>;
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

export default options;
