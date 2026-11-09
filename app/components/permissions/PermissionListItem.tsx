import * as React from 'react';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { RoleDetailedFragment } from 'app/api/operations';
import { useSwitchPermission } from 'app/features/setup/usePermissionMatrix';
import { ListRow, Switch } from 'app/ui';

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
    <ListRow
      title={title}
      supporting={description}
      disabled={!canChangePermissions}
      trailing={
        <Switch
          label={title}
          hideLabel
          disabled={!canChangePermissions}
          value={role.permissions.includes(permissionName)}
          onChange={(enabled) => switchPermission(role, permissionName, enabled)}
        />
      }
    />
  );
}
