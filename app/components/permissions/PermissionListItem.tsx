import { useUpdateRoleMutation } from 'app/api/reflection';
import * as React from 'react';
import { List, Switch } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { RoleDetailedFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';

interface IPermissionListItem {
  title: string;
  description?: string;
  role: RoleDetailedFragment;
  permissionName: string;
}

export default function PermissionListItem(props: IPermissionListItem) {
  const { title, description, role, permissionName } = props;
  const canChangePermissions = useRestriction(Permission.GrantPermission);
  const [mutationUpdatePermission] = useUpdateRoleMutation();
  const notify = useNotifications();

  return (
    <List.Item
      disabled={!canChangePermissions}
      style={{ width: '100%' }}
      right={() => (
        <Switch
          value={role.permissions.includes(permissionName)}
          onValueChange={async () => {
            const result = await mutationUpdatePermission({
              variables: {
                roleId: Number(role.id),
                permissionName,
                enabled: !role.permissions.includes(permissionName),
              },
              optimisticResponse: {
                updateRole: {
                  role: {
                    ...role,
                    permissions: !role.permissions.includes(permissionName)
                      ? role.permissions.filter((name) => name !== permissionName)
                      : [...role.permissions, permissionName],
                  },
                  errors: null,
                  fieldErrors: null,
                },
              },
            });

            if (result?.data?.updateRole?.errors?.length) {
              result?.data?.updateRole?.errors?.map((message) => notify.error(message));
            }
          }}
        />
      )}
      {...{ title, description }}
    />
  );
}
