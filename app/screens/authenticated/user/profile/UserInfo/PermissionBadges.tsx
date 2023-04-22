import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';

import { Permission } from 'app/api/schema.d';

import Badge, { IBadgeProps } from 'app/components/Badge';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';

interface IPermissionBadgesProps {
  permissions: Permission[];
  dropzoneUser: DropzoneUserEssentialsFragment;
}
export default function PermissionBadges(props: IPermissionBadgesProps) {
  const { permissions, dropzoneUser } = props;
  const { revokePermission, grantPermission } = useUserProfile();
  const notify = useNotifications();

  const canGrantPermission = useRestriction(Permission.GrantPermission);

  const badges = React.useMemo(() => permissions?.filter((name) => /^actAs/.test(name)) || [], [permissions]);

  const shouldShowBadge = React.useCallback(
    (permission: Permission) => canGrantPermission || badges.includes(permission),
    [badges, canGrantPermission]
  );

  const grant = React.useCallback(
    async function GrantPermission(permissionName: Permission) {
      const response = await grantPermission(dropzoneUser.id, permissionName);
      if ('error' in response && response.error) {
        notify.error(response.error);
      }
    },
    [dropzoneUser?.id, grantPermission, notify]
  );

  const revoke = React.useCallback(
    async function GrantPermission(permissionName: Permission) {
      const response = await revokePermission(dropzoneUser.id, permissionName);
      if ('error' in response && response.error) {
        notify.error(response.error);
      }
    },
    [notify, dropzoneUser?.id, revokePermission]
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
        Permission.ActAsLoadMaster
      ].map((permission) =>
        !shouldShowBadge(permission) ? null : (
          <Badge
            type={permission as IBadgeProps['type']}
            selected={badges.includes(permission)}
            onPress={() =>
              !canGrantPermission ? null : badges.includes(permission) ? revoke(permission) : grant(permission)
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
    justifyContent: 'space-evenly'
  }
});
