import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Row, Text } from 'app/ui';
import { useGrantPermissionMutation, useRevokePermissionMutation } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { useNotifications } from 'app/providers/notifications';
import { ACTING_PERMISSIONS, actingOf } from './profile';

/** The name of an acting permission: "Pilot", "Rig inspector" */
export function useActingLabel() {
  const { t } = useTranslation('common');
  const term = useTerms();
  return React.useCallback(
    (permission: Permission) => t(`profile.acting.${permission}`, { equipment: term('equipment') }),
    [t, term]
  );
}

export type ActingPermissionsProps = {
  membershipId: string;
  permissions: readonly string[] | null | undefined;
  testID?: string;
};

/**
 * The crew roles a member may take (pilot, load master, ground control, duty officer, equipment inspector). Those who
 * may grant and revoke permissions switch them here, one chip each; everybody else reads which they hold.
 */
export default function ActingPermissions({
  membershipId,
  permissions,
  testID = 'profile-acting',
}: ActingPermissionsProps) {
  const { t } = useTranslation('common');
  const label = useActingLabel();
  const notify = useNotifications();
  const canGrant = useRestriction(Permission.GrantPermission);
  const canRevoke = useRestriction(Permission.RevokePermission);
  const [grant] = useGrantPermissionMutation();
  const [revoke] = useRevokePermissionMutation();
  const held = actingOf(permissions);

  if (!canGrant && !canRevoke) {
    return (
      <Text testID={testID} tone={held.length ? 'default' : 'muted'}>
        {held.length ? held.map(label).join(', ') : t('profile.acting.none')}
      </Text>
    );
  }

  const toggle = async (permission: Permission) => {
    const on = held.includes(permission);
    const variables = { membershipId, permissionName: permission };
    try {
      const result = on
        ? (await revoke({ variables })).data?.revokePermission
        : (await grant({ variables })).data?.grantPermission;
      const error = result?.errors?.[0] ?? result?.fieldErrors?.[0]?.message;
      if (error) notify.error(error);
    } catch (error) {
      if (error instanceof Error) notify.error(error.message);
    }
  };

  return (
    <Row gap="sm" wrap testID={testID} role="group" aria-label={t('profile.acting.title')}>
      {ACTING_PERMISSIONS.map((permission) => {
        const on = held.includes(permission);
        return (
          <Chip
            key={permission}
            label={label(permission)}
            selected={on}
            disabled={on ? !canRevoke : !canGrant}
            testID={`${testID}-${permission}`}
            onPress={() => toggle(permission)}
          />
        );
      })}
    </Row>
  );
}
