import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { RoleDetailedFragment } from 'app/api/operations';
import { useUpdateRoleMutation } from 'app/api/reflection';
import { roleLabel } from 'app/features/people/people';
import useTerms from 'app/i18n/useTerms';
import { useNotifications } from 'app/providers/notifications';
import { withPermission, type PermissionGroupKey } from './permissions';

/** The names of the groups and permissions in the operator's words, and the name of one switch */
export function usePermissionLabels() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const words = React.useMemo(() => {
    const lower = (key: string, count = 1) => term(key, count).toLowerCase();
    return {
      operator: lower('operator'),
      load: lower('load'),
      loads: lower('load', 2),
      slot: lower('slot'),
      slots: lower('slot', 2),
      tickets: lower('ticket', 2),
      extras: lower('extra', 2),
      vehicles: lower('vehicle', 2),
      equipments: lower('equipment', 2),
      members: lower('member', 2),
    };
  }, [term]);
  const titles = React.useMemo(
    () => ({
      operator: term('operator'),
      loads: term('load', 2),
      tickets: term('ticket', 2),
      extras: term('extra', 2),
      vehicles: term('vehicle', 2),
      equipment: term('equipment'),
      members: term('member', 2),
    }),
    [term]
  );

  return React.useMemo(() => {
    const permission = (name: string) => {
      const label = t(`permissionMatrix.names.${name}`, words);
      // A capital first letter, also when a sentence starts with a term
      return label.charAt(0).toUpperCase() + label.slice(1);
    };
    return {
      group: (key: PermissionGroupKey) => t(`permissionMatrix.groups.${key}`, titles),
      permission,
      role: (role: Pick<RoleDetailedFragment, 'name'>) => roleLabel(role.name),
      cell: (role: Pick<RoleDetailedFragment, 'name'>, name: string) =>
        t('permissionMatrix.cell', { role: roleLabel(role.name), permission: permission(name) }),
    };
  }, [t, words, titles]);
}

/**
 * Switches a permission of a role on or off. The switch moves at once (an optimistic answer in the cache); when the
 * server refuses or cannot be reached, the cache drops that answer, so the switch goes back, and the reason is shown.
 */
export function useSwitchPermission() {
  const { t } = useTranslation('common');
  const notify = useNotifications();
  const [update] = useUpdateRoleMutation();

  return React.useCallback(
    async (role: RoleDetailedFragment, permission: string, enabled: boolean) => {
      try {
        const result = await update({
          variables: { roleId: Number(role.id), permissionName: permission, enabled },
          optimisticResponse: {
            updateRole: {
              __typename: 'UpdateRolePayload',
              role: {
                __typename: 'UserRole',
                id: role.id,
                name: role.name,
                permissions: withPermission(role.permissions, permission, enabled),
              },
              errors: null,
              fieldErrors: null,
            },
          },
        });
        const payload = result.data?.updateRole;
        const error =
          payload?.errors?.[0] ??
          payload?.fieldErrors?.[0]?.message ??
          (payload?.role ? undefined : t('permissionMatrix.failed'));
        if (error) notify.error(error);
      } catch (error) {
        notify.error(error instanceof Error ? error.message : t('permissionMatrix.failed'));
      }
    },
    [notify, t, update]
  );
}
