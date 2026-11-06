import { NotificationType } from 'app/api/schema.d';
import type { InboxQuery } from 'app/api/operations';

type Edges = NonNullable<
  NonNullable<NonNullable<InboxQuery['operator']>['currentUser']>['notifications']
>['edges'];
export type InboxNotification = NonNullable<NonNullable<NonNullable<Edges>[number]>['node']>;

/** The notifications of the query, newest first as the API gives them */
export function notificationsOf(data?: InboxQuery | null): InboxNotification[] {
  return (data?.operator?.currentUser?.notifications?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is InboxNotification => !!node);
}

/** Where a notification, or the push that told of it, takes the member */
export type Target =
  | { screen: 'today' }
  | { screen: 'wallet' }
  | { screen: 'inbox' }
  | { screen: 'load'; loadId: string }
  | { screen: 'inspection'; equipmentId: string; membershipId: string }
  | { screen: 'profile'; membershipId: string };

type Resource = InboxNotification['resource'];

const loadOf = (resource: Resource): string | null => {
  if (resource?.__typename === 'Load') return resource.id;
  if (resource?.__typename === 'Slot') return resource.load?.id ?? null;
  return null;
};

/** What a row of the inbox opens: the load of a call, the inspection a rig needs, the profile of an inspected rig's owner */
export function targetOf(type: NotificationType | null | undefined, resource: Resource): Target {
  switch (type) {
    case NotificationType.Boarding:
    case NotificationType.BoardingCanceled:
    case NotificationType.UserManifested: {
      const loadId = loadOf(resource);
      return loadId ? { screen: 'load', loadId } : { screen: 'today' };
    }
    case NotificationType.CreditsUpdated:
      return { screen: 'wallet' };
    case NotificationType.EquipmentInspectionRequested: {
      if (resource?.__typename === 'Equipment' && resource.owner) {
        return { screen: 'inspection', equipmentId: resource.id, membershipId: resource.owner.id };
      }
      return { screen: 'inbox' };
    }
    case NotificationType.EquipmentInspectionCompleted: {
      const owner =
        resource?.__typename === 'EquipmentInspection'
          ? resource.equipment?.owner
          : resource?.__typename === 'Equipment'
            ? resource.owner
            : null;
      return owner ? { screen: 'profile', membershipId: owner.id } : { screen: 'inbox' };
    }
    case NotificationType.MembershipUpdated:
      return { screen: 'today' };
    default:
      return { screen: 'inbox' };
  }
}

/**
 * Where a push opens the app. The push carries the type and the id of the notification, not what it is about: calls and
 * changes of the manifest open Today, money opens the Wallet, the rest opens the Inbox, where the row has its action.
 */
export function pushTargetOf(type: string | null | undefined): Target {
  switch (type) {
    case NotificationType.Boarding:
    case NotificationType.BoardingCanceled:
    case NotificationType.UserManifested:
    case NotificationType.MembershipUpdated:
      return { screen: 'today' };
    case NotificationType.CreditsUpdated:
      return { screen: 'wallet' };
    default:
      return { screen: 'inbox' };
  }
}

/** Reads what a push carries: `{ notificationId, type }`; anything else is not ours */
export function pushDataOf(data: unknown): { notificationId?: string; type?: string } {
  if (!data || typeof data !== 'object') return {};
  const { notificationId, type } = data as Record<string, unknown>;
  return {
    notificationId:
      typeof notificationId === 'string' || typeof notificationId === 'number'
        ? String(notificationId)
        : undefined,
    type: typeof type === 'string' ? type : undefined,
  };
}

const ICONS: Partial<Record<NotificationType, string>> = {
  [NotificationType.Boarding]: 'bullhorn-outline',
  [NotificationType.BoardingCanceled]: 'bullhorn-variant-outline',
  [NotificationType.UserManifested]: 'airplane-takeoff',
  [NotificationType.CreditsUpdated]: 'cash-multiple',
  [NotificationType.EquipmentInspectionRequested]: 'eye-outline',
  [NotificationType.EquipmentInspectionCompleted]: 'parachute',
  [NotificationType.PermissionGranted]: 'lock-open-outline',
  [NotificationType.PermissionRevoked]: 'lock-alert-outline',
  [NotificationType.MembershipUpdated]: 'card-account-details-outline',
  [NotificationType.PublicationRequested]: 'progress-upload',
};

/** The icon of a kind of notification */
export const iconOf = (type: NotificationType | null | undefined): string =>
  (type && ICONS[type]) || 'bell-outline';

/** The key (in `common`) of the title of a kind of notification */
export const titleKeyOf = (type: NotificationType | null | undefined): string =>
  `inbox.type.${type && type in ICONS ? type : 'other'}`;
