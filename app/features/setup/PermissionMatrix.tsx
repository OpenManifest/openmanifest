import * as React from 'react';
import { ScrollView, View } from 'react-native';
import type { RoleDetailedFragment } from 'app/api/operations';
import { Switch, Text, useTheme } from 'app/ui';
import {
  MATRIX_COLUMN_MIN_WIDTH,
  MATRIX_LABEL_WIDTH,
  PERMISSION_GROUPS,
  type PermissionGroup,
} from './permissions';
import { usePermissionLabels } from './usePermissionMatrix';

export type PermissionViewProps = {
  roles: RoleDetailedFragment[];
  /** Whether the user may change them (else every switch is disabled) */
  canEdit: boolean;
  onSwitch(role: RoleDetailedFragment, permission: string, enabled: boolean): void;
  /** The line over the permissions */
  intro: string;
  testID?: string;
};

/** The heading of a group, with the roles over their columns again: it stays at the top while its rows scroll by */
function GroupHeader({ group, roles }: { group: PermissionGroup; roles: RoleDetailedFragment[] }) {
  const theme = useTheme();
  const labels = usePermissionLabels();
  return (
    <View
      testID={`permission-group-${group.key}`}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: theme.space.lg,
        paddingBottom: theme.space.sm,
        paddingHorizontal: theme.space.md,
        backgroundColor: theme.colour.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colour.border,
      }}
    >
      <View style={{ width: MATRIX_LABEL_WIDTH, flexShrink: 0 }}>
        <Text variant="label" role="heading" aria-level={3}>
          {labels.group(group.key)}
        </Text>
      </View>
      {/* The switches carry the role in their names: the column heads are only for the eye */}
      {roles.map((role) => (
        <View
          key={role.id}
          aria-hidden
          importantForAccessibility="no-hide-descendants"
          style={{
            flex: 1,
            minWidth: MATRIX_COLUMN_MIN_WIDTH,
            alignItems: 'center',
            paddingHorizontal: theme.space.xs,
          }}
        >
          <Text variant="caption" tone="muted" numberOfLines={2} align="center">
            {labels.role(role)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function GroupRows({
  group,
  roles,
  canEdit,
  onSwitch,
}: { group: PermissionGroup } & Pick<PermissionViewProps, 'roles' | 'canEdit' | 'onSwitch'>) {
  const theme = useTheme();
  const labels = usePermissionLabels();
  return (
    <View style={{ backgroundColor: theme.colour.surface }}>
      {group.permissions.map((permission) => (
        <View
          key={permission}
          testID={`permission-row-${permission}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.space.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colour.border,
          }}
        >
          <View style={{ width: MATRIX_LABEL_WIDTH, flexShrink: 0, paddingRight: theme.space.md }}>
            <Text variant="bodyCompact">{labels.permission(permission)}</Text>
          </View>
          {roles.map((role) => (
            <View key={role.id} style={{ flex: 1, minWidth: MATRIX_COLUMN_MIN_WIDTH }}>
              <Switch
                hideLabel
                label={labels.permission(permission)}
                name={labels.cell(role, permission)}
                value={role.permissions.includes(permission)}
                disabled={!canEdit}
                onChange={(enabled) => onSwitch(role, permission, enabled)}
                testID={`permission-${role.id}-${permission}`}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Roles × permissions on a wide window: a column per role, a row per permission, in the groups of the server's access
 * list. A group's heading, with the roles over the columns, stays at the top while its rows scroll by.
 */
export default function PermissionMatrix({
  roles,
  canEdit,
  onSwitch,
  intro,
  testID = 'permission-matrix',
}: PermissionViewProps) {
  const theme = useTheme();
  // The intro is child 0; each group is a heading and its rows, and the headings stick
  const sticky = React.useMemo(() => PERMISSION_GROUPS.map((_, index) => 1 + index * 2), []);

  return (
    <ScrollView
      testID={testID}
      stickyHeaderIndices={sticky}
      contentContainerStyle={{ padding: theme.space.lg }}
    >
      <View style={{ paddingBottom: theme.space.md }}>
        <Text tone="muted">{intro}</Text>
      </View>
      {PERMISSION_GROUPS.flatMap((group) => [
        <GroupHeader key={`${group.key}-header`} group={group} roles={roles} />,
        <GroupRows
          key={`${group.key}-rows`}
          group={group}
          roles={roles}
          canEdit={canEdit}
          onSwitch={onSwitch}
        />,
      ])}
    </ScrollView>
  );
}
