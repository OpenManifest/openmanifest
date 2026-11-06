import * as React from 'react';
import { List, Switch } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { RoleDetailedFragment } from 'app/api/operations';
import { useSwitchPermission } from 'app/features/setup/usePermissionMatrix';

interface IPermissionListItem {
  title: string;
  description?: string;
  role: RoleDetailedFragment;
  permissionName: string;
}

export default function PermissionListItem(props: IPermissionListItem) {
  const { title, description, role, permissionName } = props;
  const canChangePermissions = useRestriction(Permission.GrantPermission);
  // Optimistic, and back again when the server refuses (the wizard's step; Setup has the matrix)
  const switchPermission = useSwitchPermission();

  return (
    <List.Item
      disabled={!canChangePermissions}
      style={{ width: '100%' }}
      right={() => (
        <Switch
          value={role.permissions.includes(permissionName)}
          onValueChange={(enabled) => switchPermission(role, permissionName, enabled)}
        />
      )}
      {...{ title, description }}
    />
  );
}
