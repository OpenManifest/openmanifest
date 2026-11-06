import { Permission } from 'app/api/schema.d';
import { decide, type Access, type AccessRule } from 'app/navigation/destinations';
import type { IconName } from 'app/ui';

/** The screens Setup opens: the Configuration stack's, and the conditions of the Manifest stack */
export type SetupRoute =
  | 'VehiclesScreen'
  | 'DestinationsScreen'
  | 'TicketTypesScreen'
  | 'ExtrasScreen'
  | 'OperatorEquipmentScreen'
  | 'EquipmentInspectionTemplateScreen'
  | 'WeatherConditionsScreen'
  | 'PermissionScreen'
  | 'OperatorSettingsScreen'
  | 'RulesScreen'
  | 'TransactionsScreen'
  | 'DailyLogScreen';

/** A title in the `common` namespace, or one of the operator's terms (`vehicle`, plural with `count: 2`) */
export type SetupTitle = { key: string } | { term: string; count?: number };

export type SetupEntry = AccessRule & {
  key: string;
  route: SetupRoute;
  icon: IconName;
  title: SetupTitle;
  /** Key in the `common` namespace of the line under the title; it takes the operator's terms as parameters */
  supportingKey: string;
};

export type SetupGroupKey = 'operations' | 'people' | 'business';

export type SetupGroup = {
  key: SetupGroupKey;
  /** Key in the `common` namespace */
  titleKey: string;
  entries: SetupEntry[];
};

/** Making the operator public or private (the switch at the end of Business) */
export const VISIBILITY_RULE: AccessRule = { permission: Permission.UpdateOperator };

/**
 * Setup in three groups (design plan §5.2): what runs the day, who may do what, and how the business presents itself and
 * keeps its books. An entry shows when the user has one of its permissions and the operator has its module.
 */
export const SETUP_GROUPS: SetupGroup[] = [
  {
    key: 'operations',
    titleKey: 'setupMenu.groups.operations',
    entries: [
      {
        key: 'vehicles',
        route: 'VehiclesScreen',
        icon: 'steering',
        title: { term: 'vehicle', count: 2 },
        supportingKey: 'setupMenu.vehicles',
        permission: [Permission.CreateVehicle, Permission.UpdateVehicle],
      },
      {
        key: 'destinations',
        route: 'DestinationsScreen',
        icon: 'map-marker-path',
        title: { term: 'destination', count: 2 },
        supportingKey: 'setupMenu.destinations',
        permission: Permission.UpdateOperator,
        module: 'destinations',
      },
      {
        key: 'tickets',
        route: 'TicketTypesScreen',
        icon: 'ticket-outline',
        title: { key: 'screens.ticketTypes' },
        supportingKey: 'setupMenu.tickets',
        permission: [Permission.CreateTicketType, Permission.UpdateTicketType],
      },
      {
        key: 'extras',
        route: 'ExtrasScreen',
        icon: 'plus-box-outline',
        title: { key: 'screens.ticketAddOns' },
        supportingKey: 'setupMenu.extras',
        permission: [Permission.CreateExtra, Permission.UpdateExtra],
      },
      {
        key: 'equipment',
        route: 'OperatorEquipmentScreen',
        icon: 'toolbox-outline',
        title: { term: 'equipment', count: 2 },
        supportingKey: 'setupMenu.equipment',
        permission: [
          Permission.CreateOperatorEquipment,
          Permission.UpdateOperatorEquipment,
          Permission.ReadOperatorEquipment,
        ],
        module: 'equipment',
      },
      {
        key: 'inspection',
        route: 'EquipmentInspectionTemplateScreen',
        icon: 'clipboard-check-outline',
        title: { key: 'screens.equipmentInspectionForm' },
        supportingKey: 'setupMenu.inspection',
        permission: Permission.UpdateFormTemplate,
        module: 'equipment',
      },
      {
        key: 'conditions',
        route: 'WeatherConditionsScreen',
        icon: 'weather-windy',
        title: { key: 'setupMenu.conditionsTitle' },
        supportingKey: 'setupMenu.conditions',
        permission: Permission.UpdateWeatherConditions,
        module: 'conditions',
      },
    ],
  },
  {
    key: 'people',
    titleKey: 'setupMenu.groups.people',
    entries: [
      {
        key: 'permissions',
        route: 'PermissionScreen',
        icon: 'shield-account-outline',
        title: { key: 'setupMenu.permissionsTitle' },
        supportingKey: 'setupMenu.permissions',
        permission: [
          Permission.ReadPermissions,
          Permission.GrantPermission,
          Permission.RevokePermission,
          Permission.UpdatePermissions,
        ],
      },
    ],
  },
  {
    key: 'business',
    titleKey: 'setupMenu.groups.business',
    entries: [
      {
        key: 'branding',
        route: 'OperatorSettingsScreen',
        icon: 'palette-outline',
        title: { key: 'setupMenu.brandingTitle' },
        supportingKey: 'setupMenu.branding',
        permission: Permission.UpdateOperator,
      },
      {
        key: 'rules',
        route: 'RulesScreen',
        icon: 'scale-balance',
        title: { key: 'setupMenu.rulesTitle' },
        supportingKey: 'setupMenu.rules',
        permission: Permission.UpdateOperator,
      },
      {
        key: 'money',
        route: 'TransactionsScreen',
        icon: 'cash-multiple',
        title: { key: 'destinations.money' },
        supportingKey: 'setupMenu.money',
        permission: Permission.ReadUserTransactions,
      },
      {
        key: 'dailyLog',
        route: 'DailyLogScreen',
        icon: 'notebook-outline',
        title: { term: 'daily_log' },
        supportingKey: 'setupMenu.dailyLog',
        permission: Permission.UpdateOperator,
        module: 'daily_log',
      },
    ],
  },
];

/** The groups with the entries this user may open at this operator; a group left empty is left out */
export function setupGroupsFor(access: Access, groups: SetupGroup[] = SETUP_GROUPS): SetupGroup[] {
  return groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => decide(entry, access) === 'allowed'),
    }))
    .filter((group) => group.entries.length > 0);
}

/** The entry a screen belongs to (marked in the list beside it) */
export function entryOfRoute(
  route: string | undefined,
  groups: SetupGroup[] = SETUP_GROUPS
): SetupEntry | undefined {
  return groups.flatMap((group) => group.entries).find((entry) => entry.route === route);
}

/** The screens of the Configuration stack that sit beside the Setup list on a wide window */
export const SETUP_DETAIL_ROUTES: string[] = SETUP_GROUPS.flatMap((group) =>
  group.entries.map((entry) => entry.route)
).filter((route) => route !== 'WeatherConditionsScreen');
