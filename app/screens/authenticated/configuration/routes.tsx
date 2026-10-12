import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import { OperatorEssentialsFragment } from 'app/api/operations';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['common', 'terms']);
  return (
    <AppSignalBoundary>
      <Configuration.Navigator
        screenOptions={{
          headerShown: true,
          header: (props) => <ScreenHeader {...props} />,
          cardStyle: {
            flex: 1,
          },
        }}
      >
        <Configuration.Screen
          name="SettingsMenuScreen"
          component={SettingsMenuScreen}
          options={{ title: t('common:screens.settings') }}
        />
        <Configuration.Screen
          name="OperatorSettingsScreen"
          component={OperatorSettingsScreen}
          options={{ title: t('common:screens.basicSettings') }}
        />
        <Configuration.Screen
          name="VehiclesScreen"
          component={VehiclesScreen}
          options={{ title: t('terms:vehicle', { count: 2 }) }}
        />
        <Configuration.Screen
          name="TicketTypesScreen"
          component={TicketTypeSettingsScreen}
          options={{ title: t('common:screens.ticketTypes') }}
        />
        <Configuration.Screen
          name="ExtrasScreen"
          component={ExtrasScreen}
          options={{ title: t('common:screens.ticketAddOns') }}
        />
        <Configuration.Screen
          name="RigInspectionTemplateScreen"
          component={RigInspectionTemplateScreen}
          options={{ title: t('common:screens.rigInspectionForm') }}
        />
        <Configuration.Screen
          name="OperatorRigsScreen"
          component={OperatorRigsScreen}
          options={{ title: t('common:screens.rigs') }}
        />
        <Configuration.Screen
          name="TransactionsScreen"
          component={OperatorTransactionsScreen}
          options={{ title: t('common:screens.transactions') }}
        />
        <Configuration.Screen
          name="PermissionScreen"
          component={OperatorPermissionScreen}
          options={{ title: t('common:screens.permissions') }}
        />
        <Configuration.Screen
          name="DailyLogScreen"
          component={OperatorDailyLogScreen}
          options={{ title: t('common:screens.masterLog') }}
        />
      </Configuration.Navigator>
    </AppSignalBoundary>
  );
}
