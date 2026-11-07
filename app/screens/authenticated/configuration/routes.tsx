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
import BrandingScreen from 'app/features/setup/BrandingScreen';
import VehiclesScreen from 'app/features/setup/VehiclesScreen';
import DestinationsScreen from 'app/features/setup/DestinationsScreen';
import TicketTypesScreen from 'app/features/setup/TicketTypesScreen';
import ExtrasScreen from 'app/features/setup/ExtrasScreen';
import EquipmentScreen from 'app/features/setup/EquipmentScreen';
import InspectionFormsScreen from 'app/features/setup/InspectionFormsScreen';
import CrewRolesScreen from 'app/features/setup/CrewRolesScreen';
import CertificationBodiesScreen from 'app/features/setup/CertificationBodiesScreen';
import PermissionsScreen from 'app/features/setup/PermissionsScreen';
import DailyLogScreen from 'app/features/dailylog/DailyLogScreen';
import MoneyScreen from 'app/features/money/MoneyScreen';
import { entryOfRoute, type SetupRoute } from 'app/features/setup/entries';

export type ConfigurationRoutes = {
  OperatorSettingsScreen: undefined;
  SettingsMenuScreen: undefined;
  RulesScreen: undefined;
  TicketTypesScreen: undefined;
  VehiclesScreen: undefined;
  VehicleScreen: undefined;
  DestinationsScreen: undefined;
  CrewRolesScreen: undefined;
  CertificationBodiesScreen: undefined;
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

// The roles' permissions are shown to those who may read or change them
const GuardedPermissionsScreen = guarded(PermissionsScreen, {
  permission: [
    Permission.ReadPermissions,
    Permission.UpdatePermissions,
    Permission.GrantPermission,
    Permission.RevokePermission,
  ],
});

// The operator's money is for the staff who may read others' transactions
const GuardedMoneyScreen = guarded(MoneyScreen, { permission: Permission.ReadUserTransactions });

/**
 * A Setup screen that needs a module the operator does not have (equipment, certifications, daily log, destinations)
 * says it is not available, for a deep link too: the module is the one of its entry in the Setup list.
 */
function withModuleOf<Props extends object>(Screen: React.ComponentType<Props>, route: SetupRoute) {
  const module = entryOfRoute(route)?.module;
  return module ? guarded(Screen, { module }) : Screen;
}

const ModuleDestinationsScreen = withModuleOf(DestinationsScreen, 'DestinationsScreen');
const ModuleCertificationBodiesScreen = withModuleOf(
  CertificationBodiesScreen,
  'CertificationBodiesScreen'
);
const ModuleInspectionFormsScreen = withModuleOf(
  InspectionFormsScreen,
  'EquipmentInspectionTemplateScreen'
);
const ModuleEquipmentScreen = withModuleOf(EquipmentScreen, 'OperatorEquipmentScreen');
const ModuleDailyLogScreen = withModuleOf(DailyLogScreen, 'DailyLogScreen');

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
          component={ModuleDestinationsScreen}
          options={{ title: t('terms:destination', { count: 2 }) }}
        />
        <Configuration.Screen
          name="CrewRolesScreen"
          component={CrewRolesScreen}
          options={{ title: t('common:setupMenu.crewRolesTitle') }}
        />
        <Configuration.Screen
          name="CertificationBodiesScreen"
          component={ModuleCertificationBodiesScreen}
          options={{ title: t('terms:certification_body', { count: 2 }) }}
        />
        <Configuration.Screen
          name="TicketTypesScreen"
          component={TicketTypesScreen}
          options={{ title: t('common:screens.ticketTypes') }}
        />
        <Configuration.Screen
          name="ExtrasScreen"
          component={ExtrasScreen}
          options={{ title: t('common:screens.ticketAddOns') }}
        />
        <Configuration.Screen
          name="EquipmentInspectionTemplateScreen"
          component={ModuleInspectionFormsScreen}
          options={{ title: t('common:screens.equipmentInspectionForm') }}
        />
        <Configuration.Screen
          name="OperatorEquipmentScreen"
          component={ModuleEquipmentScreen}
          options={{ title: t('common:screens.equipment') }}
        />
        <Configuration.Screen
          name="TransactionsScreen"
          component={GuardedMoneyScreen}
          options={{ title: t('common:destinations.money') }}
        />
        <Configuration.Screen
          name="PermissionScreen"
          component={GuardedPermissionsScreen}
          options={{ title: t('common:setupMenu.permissionsTitle') }}
        />
        <Configuration.Screen
          name="DailyLogScreen"
          component={ModuleDailyLogScreen}
          options={{ title: t('terms:daily_log') }}
        />
      </Configuration.Navigator>
    </AppSignalBoundary>
  );
}
