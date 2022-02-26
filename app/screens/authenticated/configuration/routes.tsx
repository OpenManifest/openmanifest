/* eslint-disable max-len */
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import { DropzoneEssentialsFragment } from 'app/api/operations';
import { NavigationProp, useNavigation } from '@react-navigation/core';
import AppBar from 'app/components/appbar/AppBar';
import SettingsMenuScreen from './settings_menu/SettingsMenuScreen';
import TicketTypeSettingsScreen from './ticket_types/TicketTypesScreen';
import DropzoneSettingsScreen from './dropzone_settings/DropzoneSettingsScreen';
import PlanesScreen from './aircrafts/AircraftsScreen';
import RigInspectionTemplateScreen from './rig_inspection_template/RigInspectionTemplateScreen';
import DropzoneRigsScreen from './rigs/DropzoneRigsScreen';
import DropzonePermissionScreen from './permissions/PermissionsScreen';
import DropzoneMasterLogScreen from './master_log/MasterLogScreen';
import DropzoneTransactionsScreen from './transactions/DropzoneTransactionsScreen';
import ExtrasScreen from './extras/ExtrasScreen';

export type ConfigurationRoutes = {
  DropzoneSettingsScreen: { dropzone: DropzoneEssentialsFragment };
  SettingsMenuScreen: undefined;
  TicketTypesScreen: undefined;
  AircraftsScreen: undefined;
  AircraftScreen: undefined;
  ExtrasScreen: undefined;
  RigInspectionTemplateScreen: undefined;
  DropzoneRigsScreen: undefined;
  TransactionsScreen: undefined;
  PermissionScreen: undefined;
  MasterLogScreen: undefined;
};

const Configuration = createStackNavigator<ConfigurationRoutes>();

export function useConfigurationNavigation() {
  return useNavigation<NavigationProp<ConfigurationRoutes>>();
}
export default function SettingsTab() {
  return (
    <Configuration.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} />,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Configuration.Screen
        name="SettingsMenuScreen"
        component={SettingsMenuScreen}
        options={{ title: 'Settings' }}
      />
      <Configuration.Screen
        name="DropzoneSettingsScreen"
        component={DropzoneSettingsScreen}
        options={{ title: 'Basic settings' }}
      />
      <Configuration.Screen
        name="AircraftsScreen"
        component={PlanesScreen}
        options={{ title: 'Planes' }}
      />
      <Configuration.Screen
        name="TicketTypesScreen"
        component={TicketTypeSettingsScreen}
        options={{ title: 'Ticket types' }}
      />
      <Configuration.Screen
        name="ExtrasScreen"
        component={ExtrasScreen}
        options={{ title: 'Ticket add-ons' }}
      />
      <Configuration.Screen
        name="RigInspectionTemplateScreen"
        component={RigInspectionTemplateScreen}
        options={{ title: 'Rig Inspection Form' }}
      />
      <Configuration.Screen
        name="DropzoneRigsScreen"
        component={DropzoneRigsScreen}
        options={{ title: 'Dropzone rigs' }}
      />
      <Configuration.Screen
        name="TransactionsScreen"
        component={DropzoneTransactionsScreen}
        options={{ title: 'Transactions' }}
      />
      <Configuration.Screen
        name="PermissionScreen"
        component={DropzonePermissionScreen}
        options={{ title: 'Permissions' }}
      />
      <Configuration.Screen
        name="MasterLogScreen"
        component={DropzoneMasterLogScreen}
        options={{ title: 'Master log' }}
      />
    </Configuration.Navigator>
  );
}
