import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import { OperatorEssentialsFragment } from 'app/api/operations';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AppBar from 'app/components/appbar/AppBar';
import { AppSignalBoundary } from 'app/components/app_signal';
import SettingsMenuScreen from './settings_menu/SettingsMenuScreen';
import TicketTypeSettingsScreen from './ticket_types/TicketTypesScreen';
import OperatorSettingsScreen from './operator_settings/OperatorSettingsScreen';
import VehiclesScreen from './vehicles/VehiclesScreen';
import RigInspectionTemplateScreen from './rig_inspection_template/RigInspectionTemplateScreen';
import OperatorRigsScreen from './rigs/OperatorRigsScreen';
import OperatorPermissionScreen from './permissions/PermissionsScreen';
import OperatorDailyLogScreen from './daily_log/DailyLogScreen';
import OperatorTransactionsScreen from './transactions/OperatorTransactionsScreen';
import ExtrasScreen from './extras/ExtrasScreen';

export type ConfigurationRoutes = {
  OperatorSettingsScreen: undefined;
  SettingsMenuScreen: undefined;
  TicketTypesScreen: undefined;
  VehiclesScreen: undefined;
  VehicleScreen: undefined;
  ExtrasScreen: undefined;
  RigInspectionTemplateScreen: undefined;
  OperatorRigsScreen: undefined;
  TransactionsScreen: undefined;
  PermissionScreen: undefined;
  DailyLogScreen: undefined;
};

const Configuration = createStackNavigator<ConfigurationRoutes>();

export function useConfigurationNavigation() {
  return useNavigation<NavigationProp<ConfigurationRoutes>>();
}
export default function SettingsTab() {
  return (
    <AppSignalBoundary>
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
          name="OperatorSettingsScreen"
          component={OperatorSettingsScreen}
          options={{ title: 'Basic settings' }}
        />
        <Configuration.Screen
          name="VehiclesScreen"
          component={VehiclesScreen}
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
          name="OperatorRigsScreen"
          component={OperatorRigsScreen}
          options={{ title: 'Dropzone rigs' }}
        />
        <Configuration.Screen
          name="TransactionsScreen"
          component={OperatorTransactionsScreen}
          options={{ title: 'Transactions' }}
        />
        <Configuration.Screen
          name="PermissionScreen"
          component={OperatorPermissionScreen}
          options={{ title: 'Permissions' }}
        />
        <Configuration.Screen
          name="DailyLogScreen"
          component={OperatorDailyLogScreen}
          options={{ title: 'Master log' }}
        />
      </Configuration.Navigator>
    </AppSignalBoundary>
  );
}
