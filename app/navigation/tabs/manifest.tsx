import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { Dropzone, DropzoneUser, Order, Slot } from 'app/api/schema.d';
import { useAppSelector } from 'app/state';
import LoadScreen from 'app/screens/authenticated/load/LoadScreen';
// eslint-disable-next-line max-len
import WeatherConditionsScreen from 'app/screens/authenticated/weather_conditions/WeatherConditionsScreen';
import JumpRunScreen from 'app/screens/authenticated/weather_conditions/JumpRunScreen';
import WindScreen from 'app/screens/authenticated/weather_conditions/WindScreen';

import ManifestScreen from 'app/screens/authenticated/manifest/ManifestScreen';
// eslint-disable-next-line max-len
import ProfileScreen from 'app/screens/authenticated/profile/ProfileScreen';
import NotificationsScreen from 'app/screens/authenticated/notifications/NotificationsScreen';
import TransactionsScreen from 'app/screens/authenticated/transactions/TransactionsScreen';
import EquipmentScreen from 'app/screens/authenticated/equipment/EquipmentScreen';

// Settings
import SettingsScreen from 'app/screens/authenticated/settings/SettingsScreen';
import TicketTypeSettingsScreen from 'app/screens/authenticated/ticket_types/TicketTypesScreen';
import UpdateDropzoneScreen from 'app/screens/authenticated/dropzones/UpdateDropzoneScreen';
import PlanesScreen from 'app/screens/authenticated/planes/PlanesScreen';
// eslint-disable-next-line max-len
import RigInspectionTemplateScreen from 'app/screens/authenticated/settings/RigInspectionTemplateScreen';
import DropzoneRigsScreen from 'app/screens/authenticated/settings/DropzoneRigsScreen';
// eslint-disable-next-line max-len
import DropzonePermissionScreen from 'app/screens/authenticated/settings/DropzonePermissionScreen';
import DropzoneMasterLogScreen from 'app/screens/authenticated/settings/DropzoneMasterLogScreen';
import UpdateExtraScreen from 'app/screens/authenticated/extras/UpdateExtraScreen';
import ExtrasScreen from 'app/screens/authenticated/extras/ExtrasScreen';
import OrderScreen from 'app/screens/authenticated/transactions/OrderScreen';
// eslint-disable-next-line max-len
import DropzoneTransactionsScreen from 'app/screens/authenticated/transactions/DropzoneTransactionsScreen';
import RigInspectionScreen from 'app/screens/authenticated/rig/RigInspectionScreen';

import AppBar from '../AppBar';

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
