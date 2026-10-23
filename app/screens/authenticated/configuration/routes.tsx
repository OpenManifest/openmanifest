import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { AppSignalBoundary } from 'app/components/app_signal';
import SetupScreen, { SetupLayout } from 'app/features/setup/SetupScreen';
import RulesScreen from 'app/features/setup/RulesScreen';
import guarded from 'app/navigation/AccessGuard';
import { Permission } from 'app/api/schema.d';
import TicketTypeSettingsScreen from './ticket_types/TicketTypesScreen';
import BrandingScreen from 'app/features/setup/BrandingScreen';
import VehiclesScreen from './vehicles/VehiclesScreen';
import EquipmentInspectionTemplateScreen from './equipment_inspection_template/EquipmentInspectionTemplateScreen';
import OperatorEquipmentScreen from './equipment/OperatorEquipmentScreen';
import OperatorPermissionScreen from './permissions/PermissionsScreen';
import OperatorDailyLogScreen from './daily_log/DailyLogScreen';
import OperatorTransactionsScreen from './transactions/OperatorTransactionsScreen';
import ExtrasScreen from './extras/ExtrasScreen';
import DestinationsScreen from './destinations/DestinationsScreen';

export type ConfigurationRoutes = {
  OperatorSettingsScreen: undefined;
  SettingsMenuScreen: undefined;
  RulesScreen: undefined;
  TicketTypesScreen: undefined;
  VehiclesScreen: undefined;
  VehicleScreen: undefined;
  DestinationsScreen: undefined;
  ExtrasScreen: undefined;
  EquipmentInspectionTemplateScreen: undefined;
  OperatorEquipmentScreen: undefined;
  TransactionsScreen: undefined;
  PermissionScreen: undefined;
  DailyLogScreen: undefined;
};

const Configuration = createStackNavigator<ConfigurationRoutes>();

// Only those who may change the operator see its rules (a link to /configuration/rules says so to the others)
const GuardedRulesScreen = guarded(RulesScreen, { permission: Permission.UpdateOperator });

export function useConfigurationNavigation() {
  return useNavigation<NavigationProp<ConfigurationRoutes>>();
}
export default function SettingsTab() {
  const { t } = useTranslation(['common', 'terms']);
  return (
    <AppSignalBoundary>
      <Configuration.Navigator
        screenLayout={(props) => <SetupLayout {...props} />}
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
          component={SetupScreen}
          options={{ title: t('common:destinations.setup') }}
        />
        <Configuration.Screen
          name="OperatorSettingsScreen"
          component={BrandingScreen}
          options={{ title: t('common:setupMenu.brandingTitle') }}
        />
        <Configuration.Screen
          name="RulesScreen"
          component={GuardedRulesScreen}
          options={{ title: t('common:setupMenu.rulesTitle') }}
        />
        <Configuration.Screen
          name="VehiclesScreen"
          component={VehiclesScreen}
          options={{ title: t('terms:vehicle', { count: 2 }) }}
        />
        <Configuration.Screen
          name="DestinationsScreen"
          component={DestinationsScreen}
          options={{ title: t('terms:destination', { count: 2 }) }}
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
          name="EquipmentInspectionTemplateScreen"
          component={EquipmentInspectionTemplateScreen}
          options={{ title: t('common:screens.equipmentInspectionForm') }}
        />
        <Configuration.Screen
          name="OperatorEquipmentScreen"
          component={OperatorEquipmentScreen}
          options={{ title: t('common:screens.equipment') }}
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
