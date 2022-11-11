import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';

import { actions, useAppDispatch } from 'app/state';
import { Permission } from 'app/api/schema.d';
// eslint-disable-next-line max-len
import Badge, { IBadgeProps } from 'app/components/Badge';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';

interface IPermissionBadgesProps {
  permissions: Permission[];
  dropzoneUser: DropzoneUserEssentialsFragment;
}
export default function PermissionBadges(props: IPermissionBadgesProps) {
  const { permissions, dropzoneUser } = props;
  const dispatch = useAppDispatch();
  const { revokePermission, grantPermission } = useUserProfile();

  const canGrantPermission = useRestriction(Permission.GrantPermission);

  const badges = React.useMemo(
    () => permissions?.filter((name) => /^actAs/.test(name)) || [],
    [permissions]
  );

  const shouldShowBadge = React.useCallback(
    (permission: Permission) => canGrantPermission || badges.includes(permission),
    [badges, canGrantPermission]
  );

  const grant = React.useCallback(
    async function GrantPermission(permissionName: Permission) {
      const response = await grantPermission(dropzoneUser.id, permissionName);
      if ('error' in response && response.error) {
        dispatch(actions.notifications.showSnackbar({ message: response.error, variant: 'error' }));
      }
    },
    [dispatch, dropzoneUser?.id, grantPermission]
  );

  const revoke = React.useCallback(
    async function GrantPermission(permissionName: Permission) {
      const response = await revokePermission(dropzoneUser.id, permissionName);
      if ('error' in response && response.error) {
        dispatch(actions.notifications.showSnackbar({ message: response.error, variant: 'error' }));
      }
    },
    [dispatch, dropzoneUser?.id, revokePermission]
  );
  return (
    <ScrollView
      horizontal
      style={{ width: '100%' }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {[
        Permission.ActAsPilot,
        Permission.ActAsDzso,
        Permission.ActAsGca,
        Permission.ActAsRigInspector,
        Permission.ActAsLoadMaster,
      ].map((permission) =>
        !shouldShowBadge(permission) ? null : (
          <Badge
            type={permission as IBadgeProps['type']}
            selected={badges.includes(permission)}
            onPress={() =>
              // eslint-disable-next-line no-nested-ternary
              !canGrantPermission
                ? null
                : badges.includes(permission)
                ? revoke(permission)
                : grant(permission)
            }
          />
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingVertical: 12,
    justifyContent: 'space-evenly',
  },
});
