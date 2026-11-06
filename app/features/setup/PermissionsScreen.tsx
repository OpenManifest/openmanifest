import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRolesQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import { EmptyState, Skeleton, Stack, useTheme } from 'app/ui';
import PermissionMatrix from './PermissionMatrix';
import { matrixFits } from './permissions';
import RolePermissions from './RolePermissions';
import { useRefetchOnFocus } from './useResourceEditor';
import { useSwitchPermission } from './usePermissionMatrix';

/**
 * Roles and permissions (Setup → People, `/configuration/permissions`): on a wide window a matrix of every role against
 * every permission; on a narrower one, or with more roles than fit, the permissions of one role at a time. Those who
 * may update permissions switch them; the others read them. A member's own acting permissions are on their profile.
 */
export default function PermissionsScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const {
    operator: { operator },
  } = useOperatorContext();
  const operatorId = operator?.id?.toString();
  const { data, loading, refetch } = useRolesQuery({
    variables: { operatorId: operatorId as string },
    skip: !operatorId,
  });
  useRefetchOnFocus(refetch, !operatorId);
  const canEdit = useRestriction(Permission.UpdatePermissions);
  const onSwitch = useSwitchPermission();
  const expanded = useBreakpoint() === 'expanded';
  const [width, setWidth] = React.useState(0);
  const roles = data?.operator?.roles ?? [];
  const asMatrix = expanded && matrixFits(width - 2 * (theme.space.lg + theme.space.md), roles.length);
  const readOnly = canEdit ? '' : ` ${t('permissionMatrix.readOnly')}`;

  let content: React.ReactNode;
  if (!roles.length && loading) {
    content = (
      <View style={{ padding: theme.space.lg }}>
        <Stack gap="md" testID="permissions-loading">
          <Skeleton height={theme.density.row} />
          <Skeleton lines={6} />
        </Stack>
      </View>
    );
  } else if (!roles.length) {
    content = (
      <EmptyState
        icon="shield-account-outline"
        title={t('permissionMatrix.emptyTitle')}
        body={t('permissionMatrix.emptyBody')}
      />
    );
  } else if (asMatrix) {
    content = (
      <PermissionMatrix
        roles={roles}
        canEdit={canEdit}
        onSwitch={onSwitch}
        intro={`${t('permissionMatrix.intro')}${readOnly}`}
      />
    );
  } else {
    content = (
      <RolePermissions
        roles={roles}
        canEdit={canEdit}
        onSwitch={onSwitch}
        intro={`${t('permissionMatrix.introCompact')}${readOnly}`}
      />
    );
  }

  return (
    <ScreenContainer edges={['bottom']} testID="permissions">
      <View
        style={{ flex: 1 }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        testID={asMatrix ? 'permissions-matrix-mode' : 'permissions-list-mode'}
      >
        {content}
      </View>
    </ScreenContainer>
  );
}
