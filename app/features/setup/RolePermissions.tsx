import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FORM_COLUMN_MAX_WIDTH } from 'app/components/layout/FormColumn';
import { Select, Stack, Subheader, Switch, Text, useTheme } from 'app/ui';
import { PERMISSION_GROUPS } from './permissions';
import type { PermissionViewProps } from './PermissionMatrix';
import { usePermissionLabels } from './usePermissionMatrix';

/**
 * The permissions of one role at a time, for a window too narrow for the matrix: the role is chosen above, its
 * permissions follow in the groups of the access list, one switch each.
 */
export default function RolePermissions({
  roles,
  canEdit,
  onSwitch,
  intro,
  testID = 'role-permissions',
}: PermissionViewProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const labels = usePermissionLabels();
  const [chosen, setChosen] = React.useState<string | undefined>(roles[0]?.id);
  const role = roles.find((candidate) => candidate.id === chosen) ?? roles[0];

  return (
    <ScrollView
      testID={testID}
      contentContainerStyle={{
        width: '100%',
        maxWidth: FORM_COLUMN_MAX_WIDTH,
        alignSelf: 'center',
        padding: theme.space.lg,
      }}
    >
      <Stack gap="md">
        <Text tone="muted">{intro}</Text>
        <Select
          label={t('permissionMatrix.role')}
          options={roles.map((option) => ({ value: option.id, label: labels.role(option) }))}
          value={role?.id}
          onChange={setChosen}
          testID="permission-role"
        />
      </Stack>
      {role
        ? PERMISSION_GROUPS.map((group) => (
            <View key={group.key} testID={`permission-group-${group.key}`}>
              <Subheader>{labels.group(group.key)}</Subheader>
              {group.permissions.map((permission) => (
                <Switch
                  key={permission}
                  label={labels.permission(permission)}
                  name={labels.cell(role, permission)}
                  value={role.permissions.includes(permission)}
                  disabled={!canEdit}
                  onChange={(enabled) => onSwitch(role, permission, enabled)}
                  testID={`permission-${role.id}-${permission}`}
                />
              ))}
            </View>
          ))
        : null}
    </ScrollView>
  );
}
