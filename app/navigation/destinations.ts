import { ModerationRole, Permission } from 'app/api/schema.d';

/**
 * The places a person can go from the shell, in order (design plan §5.1). One table decides the tabs, the rail and the
 * sidebar for every role and every operator: a destination is shown when the signed-in user has its permission and the
 * operator has its module. Later phases add Bookings and Shop here.
 */
export type DestinationKey =
  | 'today'
  | 'board'
  | 'people'
  | 'inbox'
  | 'wallet'
  | 'money'
  | 'reports'
  | 'setup'
  | 'platform'
  | 'account';

/** Which tab of the authenticated navigator holds the destination, and its web path */
export type DestinationRoute = {
  tab:
    'Today' | 'Overview' | 'Manifest' | 'Users' | 'Notifications' | 'Wallet' | 'More' | 'Account';
  path: string;
};

export type AccessRule = {
  /** The user needs one of these permissions */
  permission?: Permission | Permission[];
  /** The user must not have any of these (the Wallet is for those who do not run the money) */
  withoutPermission?: Permission | Permission[];
  /** The operator needs this module (`operator.modules`) */
  module?: string;
  /** Only moderators of the platform */
  moderator?: boolean;
  /** Allowed when any of these rules is */
  any?: AccessRule[];
};

export type Destination = AccessRule & {
  key: DestinationKey;
  /** `compact` shows `primary` destinations as tabs and the rest under More; `account` goes to the account menu */
  group: 'primary' | 'more' | 'account';
  icon: string;
  /** Key in the `common` namespace */
  labelKey: string;
  /** Where it opens as a tab of the authenticated navigator; `undefined` for the ones that are not a tab */
  route?: DestinationRoute;
  /** Where it opens when it is not a tab (a web path, resolved by the linking config); `undefined` until it is built (U3 to U5) */
  path?: string;
  /** Names of the screens it is the home of: it is the current item while one of them is shown */
  routeNames?: string[];
};

const asList = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : ([value].flat() as T[]);

export const DESTINATIONS: Destination[] = [
  {
    key: 'today',
    group: 'primary',
    icon: 'home-outline',
    labelKey: 'destinations.today',
    route: { tab: 'Today', path: '/today' },
  },
  {
    key: 'board',
    group: 'primary',
    icon: 'view-list-outline',
    labelKey: 'destinations.board',
    permission: Permission.ReadLoad,
    route: { tab: 'Manifest', path: '/manifest' },
  },
  {
    key: 'people',
    group: 'primary',
    icon: 'account-group-outline',
    labelKey: 'destinations.people',
    permission: Permission.ReadUser,
    route: { tab: 'Users', path: '/users' },
  },
  {
    key: 'inbox',
    group: 'primary',
    icon: 'bell-outline',
    labelKey: 'destinations.inbox',
    route: { tab: 'Notifications', path: '/notifications' },
  },
  {
    key: 'wallet',
    group: 'primary',
    icon: 'wallet-outline',
    labelKey: 'destinations.wallet',
    withoutPermission: Permission.ReadUserTransactions,
    route: { tab: 'Wallet', path: '/wallet' },
  },
  {
    key: 'money',
    group: 'more',
    icon: 'cash-multiple',
    labelKey: 'destinations.money',
    permission: Permission.ReadUserTransactions,
    path: '/transactions',
    routeNames: ['TransactionsScreen', 'OperatorTransactionsScreen'],
  },
  {
    key: 'reports',
    group: 'more',
    icon: 'chart-box-outline',
    labelKey: 'destinations.reports',
    permission: Permission.ViewStatistics,
  },
  {
    key: 'setup',
    group: 'more',
    icon: 'cog-outline',
    labelKey: 'destinations.setup',
    permission: [Permission.UpdateOperator, Permission.UpdateUser],
    path: '/configuration',
    routeNames: [
      'SettingsMenuScreen',
      'OperatorSettingsScreen',
      'RulesScreen',
      'VehiclesScreen',
      'DestinationsScreen',
      'TicketTypesScreen',
      'ExtrasScreen',
      'OperatorEquipmentScreen',
      'EquipmentInspectionTemplateScreen',
      'PermissionScreen',
      'DailyLogScreen',
      'WeatherConditionsScreen',
      'JumpRunScreen',
      'WindScreen',
    ],
  },
  {
    key: 'platform',
    group: 'more',
    icon: 'earth',
    labelKey: 'destinations.platform',
    moderator: true,
    route: { tab: 'Overview', path: '/overview' },
  },
  {
    key: 'account',
    group: 'account',
    icon: 'account-circle-outline',
    labelKey: 'destinations.account',
  },
];

export type Access = {
  permissions: Permission[];
  /** `operator.modules`: the enabled modules with their configuration */
  modules: Record<string, unknown>;
  moderationRole?: ModerationRole | null;
};

export type AccessDecision = 'allowed' | 'no-access' | 'not-available';

/** Whether the user may use what the rule guards; a module the operator lacks wins over a permission the user lacks */
export function decide(rule: AccessRule, access: Access): AccessDecision {
  if (rule.any) {
    const decisions = rule.any.map((alternative) => decide(alternative, access));
    if (decisions.includes('allowed')) return 'allowed';
    return decisions.every((decision) => decision === 'not-available')
      ? 'not-available'
      : 'no-access';
  }
  if (rule.module && !(rule.module in access.modules)) return 'not-available';
  if (rule.moderator && !(access.moderationRole && access.moderationRole !== ModerationRole.User)) {
    return 'no-access';
  }
  const needs = asList(rule.permission);
  if (needs.length && !needs.some((permission) => access.permissions.includes(permission))) {
    return 'no-access';
  }
  const forbids = asList(rule.withoutPermission);
  if (forbids.some((permission) => access.permissions.includes(permission))) return 'no-access';
  return 'allowed';
}

/** The destinations of a user at an operator, in table order */
export function destinationsFor(
  access: Access,
  table: Destination[] = DESTINATIONS
): Destination[] {
  return table.filter((destination) => decide(destination, access) === 'allowed');
}

export const destinationByKey = (key: DestinationKey) =>
  DESTINATIONS.find((destination) => destination.key === key) as Destination;
