import { Permission } from 'app/api/schema.d';

export type PermissionGroupKey =
  | 'acting'
  | 'operator'
  | 'weather_conditions'
  | 'load'
  | 'slot'
  | 'ticket_types'
  | 'ticket_addons'
  | 'vehicles'
  | 'equipment'
  | 'permissions'
  | 'pack_jobs'
  | 'form_templates'
  | 'users'
  | 'payments'
  | 'activity_feed'
  | 'statistics';

export type PermissionGroup = {
  key: PermissionGroupKey;
  permissions: Permission[];
};

/**
 * The permissions in the groups and order of the server's `config/seed/access.yml` (the acting permissions, then one
 * group per resource). The API lists neither groups nor descriptions, so they are kept here; a test checks that every
 * permission of the schema is in exactly one group.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'acting',
    permissions: [
      Permission.ActAsPilot,
      Permission.ActAsLoadMaster,
      Permission.ActAsGca,
      Permission.ActAsDutyOfficer,
      Permission.ActAsEquipmentInspector,
    ],
  },
  {
    key: 'operator',
    permissions: [
      Permission.UpdateOperator,
      Permission.DeleteOperator,
      Permission.UndeleteOperator,
    ],
  },
  { key: 'weather_conditions', permissions: [Permission.UpdateWeatherConditions] },
  {
    key: 'load',
    permissions: [
      Permission.CreateLoad,
      Permission.UpdateLoad,
      Permission.DeleteLoad,
      Permission.ReadLoad,
    ],
  },
  {
    key: 'slot',
    permissions: [
      Permission.CreateSlot,
      Permission.CreateDoubleSlot,
      Permission.UpdateSlot,
      Permission.DeleteSlot,
      Permission.CreateUserSlot,
      Permission.CreateUserDoubleSlot,
      Permission.CreateUserSlotWithSelf,
      Permission.CreatePrepaidSlot,
      Permission.UpdateUserSlot,
      Permission.DeleteUserSlot,
      Permission.UndeleteUserSlot,
      Permission.CreateStudentSlot,
      Permission.UpdateStudentSlot,
      Permission.DeleteStudentSlot,
      Permission.UndeleteStudentSlot,
    ],
  },
  {
    key: 'ticket_types',
    permissions: [
      Permission.CreateTicketType,
      Permission.UpdateTicketType,
      Permission.DeleteTicketType,
      Permission.UndeleteTicketType,
    ],
  },
  {
    key: 'ticket_addons',
    permissions: [
      Permission.CreateExtra,
      Permission.UpdateExtra,
      Permission.DeleteExtra,
      Permission.ReadExtra,
      Permission.UndeleteExtra,
    ],
  },
  {
    key: 'vehicles',
    permissions: [
      Permission.CreateVehicle,
      Permission.UpdateVehicle,
      Permission.DeleteVehicle,
      Permission.UndeleteVehicle,
    ],
  },
  {
    key: 'equipment',
    permissions: [
      Permission.CreateEquipment,
      Permission.UpdateEquipment,
      Permission.DeleteEquipment,
      Permission.ReadEquipment,
      Permission.UndeleteEquipment,
      Permission.CreateOperatorEquipment,
      Permission.UpdateOperatorEquipment,
      Permission.DeleteOperatorEquipment,
      Permission.ReadOperatorEquipment,
      Permission.UndeleteOperatorEquipment,
    ],
  },
  {
    key: 'permissions',
    permissions: [
      Permission.ReadPermissions,
      Permission.UpdatePermissions,
      Permission.GrantPermission,
      Permission.RevokePermission,
    ],
  },
  {
    key: 'pack_jobs',
    permissions: [
      Permission.CreatePackjob,
      Permission.UpdatePackjob,
      Permission.DeletePackjob,
      Permission.ReadPackjob,
    ],
  },
  {
    key: 'form_templates',
    permissions: [
      Permission.CreateFormTemplate,
      Permission.UpdateFormTemplate,
      Permission.DeleteFormTemplate,
      Permission.ReadFormTemplate,
    ],
  },
  {
    key: 'users',
    permissions: [
      Permission.ReadUser,
      Permission.UpdateUser,
      Permission.DeleteUser,
      Permission.CreateUser,
      Permission.UndeleteUser,
    ],
  },
  {
    key: 'payments',
    permissions: [Permission.CreateUserTransaction, Permission.ReadUserTransactions],
  },
  {
    key: 'activity_feed',
    permissions: [
      Permission.ViewSystemActivity,
      Permission.ViewUserActivity,
      Permission.ViewAdminActivity,
    ],
  },
  { key: 'statistics', permissions: [Permission.ViewRevenue, Permission.ViewStatistics] },
];

/** A role's permissions after switching one on or off (the order kept, no duplicates) */
export function withPermission(
  permissions: readonly string[],
  permission: string,
  enabled: boolean
): string[] {
  const without = permissions.filter((name) => name !== permission);
  return enabled ? [...without, permission] : without;
}

/** The width of the column of permission names in the matrix */
export const MATRIX_LABEL_WIDTH = 240;
/** The narrowest a role's column of the matrix may be */
export const MATRIX_COLUMN_MIN_WIDTH = 76;

/** Whether a matrix of `roles` columns fits `width` (else each role is shown on its own, as a list) */
export function matrixFits(width: number, roles: number): boolean {
  return width >= MATRIX_LABEL_WIDTH + roles * MATRIX_COLUMN_MIN_WIDTH;
}
