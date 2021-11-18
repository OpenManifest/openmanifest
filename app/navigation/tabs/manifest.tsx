import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import useCurrentDropzone from '../../api/hooks/useCurrentDropzone';
import { Dropzone, DropzoneUser, Order, Slot } from '../../api/schema.d';
import { useAppSelector } from '../../state';
import LoadScreen from '../../screens/authenticated/load/LoadScreen';
// eslint-disable-next-line max-len
import WeatherConditionsScreen from '../../screens/authenticated/weather_conditions/WeatherConditionsScreen';
import JumpRunScreen from '../../screens/authenticated/weather_conditions/JumpRunScreen';
import WindScreen from '../../screens/authenticated/weather_conditions/WindScreen';
import AppBar from '../AppBar';

import ManifestScreen from '../../screens/authenticated/manifest/ManifestScreen';
import ManifestGroupScreen from '../../screens/authenticated/manifest/ManifestGroupScreen';
// eslint-disable-next-line max-len
import ManifestGroupUserSelectScreen from '../../screens/authenticated/manifest/ManifestGroupUserSelectScreen';
import ProfileScreen from '../../screens/authenticated/profile/ProfileScreen';
import NotificationsScreen from '../../screens/authenticated/notifications/NotificationsScreen';
import TransactionsScreen from '../../screens/authenticated/transactions/TransactionsScreen';
import EquipmentScreen from '../../screens/authenticated/equipment/EquipmentScreen';

// Settings
import SettingsScreen from '../../screens/authenticated/settings/SettingsScreen';
import TicketTypeSettingsScreen from '../../screens/authenticated/ticket_types/TicketTypesScreen';
import UpdateDropzoneScreen from '../../screens/authenticated/dropzones/UpdateDropzoneScreen';
import PlanesScreen from '../../screens/authenticated/planes/PlanesScreen';
// eslint-disable-next-line max-len
import RigInspectionTemplateScreen from '../../screens/authenticated/settings/RigInspectionTemplateScreen';
import DropzoneRigsScreen from '../../screens/authenticated/settings/DropzoneRigsScreen';
// eslint-disable-next-line max-len
import DropzonePermissionScreen from '../../screens/authenticated/settings/DropzonePermissionScreen';
import DropzoneMasterLogScreen from '../../screens/authenticated/settings/DropzoneMasterLogScreen';
import UpdateExtraScreen from '../../screens/authenticated/extras/UpdateExtraScreen';
import ExtrasScreen from '../../screens/authenticated/extras/ExtrasScreen';
import OrderScreen from '../../screens/authenticated/transactions/OrderScreen';
import DropzoneTransactionsScreen from '../../screens/authenticated/transactions/DropzoneTransactionsScreen';
import RigInspectionScreen from '../../screens/authenticated/rig/RigInspectionScreen';

export type IManifestTabParams = {
  DropzoneScreen: undefined;
  LoadScreen: undefined;
  ManifestGroupUserSelectScreen: undefined;
  WeatherConditionsScreen: undefined;
  WindScreen: undefined;
  JumpRunScreen: undefined;
  Settings: undefined;
  Profile: undefined;
  ManifestGroupScreen: {
    users?: DropzoneUser[];
    slots?: Slot[];
    loadId?: number;
  };

  ProfileScreen: {
    userId: string;
  };
  NotificationsScreen: undefined;
  EquipmentScreen: undefined;
  TransactionsScreen: undefined;

  SettingsScreen: undefined;
  UpdateDropzoneScreen: { dropzone: Dropzone };
  TicketTypeSettingsScreen: undefined;
  PlanesScreen: undefined;
  PlaneScreen: undefined;
  TicketTypesScreen: undefined;
  UpdateExtraScreen: undefined;
  ExtrasScreen: undefined;
  RigInspectionTemplateScreen: undefined;
  DropzoneRigsScreen: undefined;
  DropzonePermissionScreen: undefined;
  DropzoneMasterLogScreen: undefined;
  RigInspectionScreen: undefined;
  DropzoneTransactionsScreen: undefined;
  OrderScreen: {
    order: Order;
  };
};

const Manifest = createStackNavigator<IManifestTabParams>();

export default function ManifestTab() {
  const globalState = useAppSelector((root) => root.global);
  const { currentUser } = useCurrentDropzone();

  return (
    <Manifest.Navigator
      screenOptions={{
        headerShown: !!(globalState.credentials && globalState.currentDropzone),
        header: (props) => <AppBar {...props} />,
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Manifest.Screen
        name="DropzoneScreen"
        component={ManifestScreen}
        options={{ title: 'Manifest' }}
      />
      <Manifest.Screen
        name="WeatherConditionsScreen"
        component={WeatherConditionsScreen}
        options={{ headerShown: false }}
      />
      <Manifest.Screen
        name="WindScreen"
        component={WindScreen}
        options={{ title: 'Winds Aloft' }}
      />
      <Manifest.Screen
        name="JumpRunScreen"
        component={JumpRunScreen}
        options={{ title: 'Jump Run' }}
      />
      <Manifest.Screen name="LoadScreen" component={LoadScreen} options={{ title: 'Load' }} />
      <Manifest.Screen
        name="ManifestGroupScreen"
        component={ManifestGroupScreen}
        options={{ title: 'Manifest group' }}
      />
      <Manifest.Screen
        name="ManifestGroupUserSelectScreen"
        component={ManifestGroupUserSelectScreen}
        options={{ title: 'Select users' }}
      />

      {/* PROFILE */}
      <Manifest.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{
          userId: currentUser?.id,
        }}
      />
      <Manifest.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Manifest.Screen
        name="EquipmentScreen"
        component={EquipmentScreen}
        options={{ title: 'Equipment' }}
      />
      <Manifest.Screen
        name="TransactionsScreen"
        component={TransactionsScreen}
        options={{ title: 'Account History' }}
      />

      <Manifest.Screen name="OrderScreen" component={OrderScreen} options={{ title: 'Order' }} />

      <Manifest.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Manifest.Screen
        name="UpdateDropzoneScreen"
        component={UpdateDropzoneScreen}
        options={{ title: 'Basic settings' }}
      />
      <Manifest.Screen name="PlanesScreen" component={PlanesScreen} options={{ title: 'Planes' }} />
      <Manifest.Screen
        name="TicketTypesScreen"
        component={TicketTypeSettingsScreen}
        options={{ title: 'Ticket types' }}
      />
      <Manifest.Screen
        name="UpdateExtraScreen"
        component={UpdateExtraScreen}
        options={{ title: 'Update ticket add-on' }}
      />
      <Manifest.Screen
        name="ExtrasScreen"
        component={ExtrasScreen}
        options={{ title: 'Ticket add-ons' }}
      />
      <Manifest.Screen
        name="RigInspectionTemplateScreen"
        component={RigInspectionTemplateScreen}
        options={{ title: 'Rig Inspection Form' }}
      />
      <Manifest.Screen
        name="RigInspectionScreen"
        component={RigInspectionScreen}
        options={{ title: 'Rig Inspection' }}
      />
      <Manifest.Screen
        name="DropzoneRigsScreen"
        component={DropzoneRigsScreen}
        options={{ title: 'Dropzone rigs' }}
      />
      <Manifest.Screen
        name="DropzoneTransactionsScreen"
        component={DropzoneTransactionsScreen}
        options={{ title: 'Order Activity' }}
      />
      <Manifest.Screen
        name="DropzonePermissionScreen"
        component={DropzonePermissionScreen}
        options={{ title: 'Permissions' }}
      />
      <Manifest.Screen
        name="DropzoneMasterLogScreen"
        component={DropzoneMasterLogScreen}
        options={{ title: 'Master log' }}
      />
    </Manifest.Navigator>
  );
}
