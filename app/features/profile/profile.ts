import { DateTime } from 'luxon';
import type { ProfileQuery } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';

export type Profile = NonNullable<ProfileQuery['membership']>;
export type ProfileRule = Profile['eligibility']['rules'][number];
export type ProfileSlot = NonNullable<
  NonNullable<NonNullable<NonNullable<Profile['slots']>['edges']>[number]>['node']
>;
export type ProfileEquipment = NonNullable<Profile['user']['equipment']>[number];
export type ProfileInspection = NonNullable<Profile['equipmentInspections']>[number];
export type ProfileCertification = NonNullable<Profile['user']['userCertifications']>[number];

/** What the person looking at a profile may do there: a member on their own, staff by their permissions */
export type Abilities = {
  /** The profile is the viewer's own */
  self: boolean;
  /** Name, contact details, body mass and certification level (the member themselves, or `updateUser`) */
  editDetails: boolean;
  /** Role, membership expiry and acting permissions (`updateUser`) */
  editMembership: boolean;
  /** Put money on their account, or take it off (`createUserTransaction`) */
  addCredit: boolean;
  /** Read the orders of anybody, the office's Money (`readUserTransactions`); a member reads their own in the Wallet */
  readTransactions: boolean;
  /** Add and edit their personal equipment (their own with `createEquipment`; staff with `updateUser`, UB.2) */
  manageEquipment: boolean;
  /** Fill in an inspection of their equipment (`actAsEquipmentInspector`) */
  inspect: boolean;
  /** Archive the membership (`deleteUser`, never their own from here) */
  remove: boolean;
};

/** The viewer's abilities on a profile, from whose it is and the viewer's permissions at the operator */
export function abilitiesOf(
  viewerId: string | null | undefined,
  profileId: string | null | undefined,
  permissions: readonly (Permission | string)[]
): Abilities {
  const has = (permission: Permission) => permissions.includes(permission);
  const self = !!viewerId && viewerId === profileId;
  const staff = has(Permission.UpdateUser);
  return {
    self,
    editDetails: self || staff,
    editMembership: staff,
    addCredit: has(Permission.CreateUserTransaction),
    readTransactions: has(Permission.ReadUserTransactions),
    manageEquipment: (self && has(Permission.CreateEquipment)) || staff,
    inspect: has(Permission.ActAsEquipmentInspector),
    remove: !self && has(Permission.DeleteUser),
  };
}

/** The rules a profile lists: those the operator asks for (a rule it does not require says nothing about the member) */
export function profileRules<R extends Pick<ProfileRule, 'status'>>(rules: readonly R[]): R[] {
  return rules.filter((rule) => rule.status !== 'NOT_REQUIRED');
}

/** Where a rule is put right from a profile */
export type Fix = 'details' | 'membership' | 'credit' | 'wallet' | 'equipment' | 'wizard';

/**
 * What puts a rule right, for the person looking, or nothing when they cannot (a member cannot extend their own
 * membership: that is the manifest desk). Credit is added by staff; a member sees their wallet.
 */
export function fixOf(code: string, abilities: Abilities): Fix | null {
  switch (code) {
    case 'membership':
      return abilities.editMembership ? 'membership' : null;
    case 'credits':
      if (abilities.addCredit) return 'credit';
      return abilities.self ? 'wallet' : null;
    case 'certification':
    case 'certification_level_missing':
    case 'body_mass':
    case 'body_mass_missing':
      return abilities.editDetails ? 'details' : null;
    case 'age':
    case 'date_of_birth_missing':
      return abilities.editDetails ? 'wizard' : null;
    case 'equipment':
    case 'equipment_missing':
    case 'equipment_inspection':
    case 'equipment_not_inspected':
    case 'equipment_service':
    case 'equipment_overdue':
      return abilities.manageEquipment || abilities.inspect ? 'equipment' : null;
    default:
      return null;
  }
}

/** The loads a member was on, newest first, from the connection of the query */
export function slotsOf(profile?: Pick<Profile, 'slots'> | null): ProfileSlot[] {
  return (profile?.slots?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is ProfileSlot => !!node);
}

/** The inspection that clears an item: the last one that said it is fine, or none */
export function inspectionOf(
  equipmentId: string,
  inspections: readonly ProfileInspection[] | null | undefined
): ProfileInspection | null {
  const passed = (inspections ?? []).filter(
    (inspection) => inspection.isOk && inspection.equipment?.id === equipmentId
  );
  return passed.length ? passed[passed.length - 1] : null;
}

export type MembershipState = 'none' | 'active' | 'expiring' | 'expired';

/** How long before it runs out a membership counts as expiring (the API's `Eligibility::EXPIRING_WITHIN`) */
export const EXPIRING_DAYS = 14;

/** Whether a membership runs (`expiresAt` in seconds since the epoch): none, active, expiring within 14 days, expired */
export function membershipStateOf(
  expiresAt: number | null | undefined,
  now: DateTime = DateTime.now()
): MembershipState {
  if (!expiresAt) return 'none';
  const expires = DateTime.fromSeconds(expiresAt);
  if (expires <= now) return 'expired';
  return expires <= now.plus({ days: EXPIRING_DAYS }) ? 'expiring' : 'active';
}

/** The acting permissions a member can be given on a profile, in the order they show */
export const ACTING_PERMISSIONS = [
  Permission.ActAsPilot,
  Permission.ActAsLoadMaster,
  Permission.ActAsGca,
  Permission.ActAsDutyOfficer,
  Permission.ActAsEquipmentInspector,
] as const;

/** The acting permissions a member holds, in the order they show */
export function actingOf(permissions: readonly string[] | null | undefined): Permission[] {
  return ACTING_PERMISSIONS.filter((permission) => (permissions ?? []).includes(permission));
}

/** Whether a qualification still counts: the server says so, and an expiry date has not passed */
export function qualificationState(
  qualification: { current: boolean; expiresAt?: string | null },
  now: DateTime = DateTime.now()
): 'current' | 'expiring' | 'expired' {
  if (!qualification.current) return 'expired';
  if (!qualification.expiresAt) return 'current';
  const expires = DateTime.fromISO(qualification.expiresAt);
  if (!expires.isValid) return 'current';
  if (expires <= now) return 'expired';
  return expires <= now.plus({ days: EXPIRING_DAYS }) ? 'expiring' : 'current';
}
