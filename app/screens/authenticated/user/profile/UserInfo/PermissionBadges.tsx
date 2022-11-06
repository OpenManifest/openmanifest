import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  DropzoneUserEssentialsFragment,
  DropzoneUsersQuery,
  DropzoneUsersQueryVariables,
} from 'app/api/operations';

import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Permission } from 'app/api/schema.d';

import {
  CurrentUserPermissionsDocument,
  DropzoneUsersDocument,
  DropzoneUserProfileDocument,
  useGrantPermissionMutation,
  useRevokePermissionMutation,
  DropzoneUsersDetailedDocument,
} from 'app/api/reflection';
// eslint-disable-next-line max-len
import Badge, { IBadgeProps } from 'app/components/Badge';
import useRestriction from 'app/hooks/useRestriction';
import mutationHandlers from 'app/api/utils/createErrorHandler';

interface IPermissionBadgesProps {
  permissions: Permission[];
  dropzoneUser: DropzoneUserEssentialsFragment;
}
export default function PermissionBadges(props: IPermissionBadgesProps) {
  const { permissions, dropzoneUser } = props;
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const canGrantPermission = useRestriction(Permission.GrantPermission);

  const [revoke] = useRevokePermissionMutation({
    ...mutationHandlers({
      onSuccess: (payload) => {
        dispatch(actions.notifications.showSnackbar({ message: 'Permission revoked' }));
      },
      onError: (error) => {
        dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' }));
      },
    }),
    refetchQueries: [
      { query: DropzoneUsersDocument },
      { query: DropzoneUsersDetailedDocument },
      {
        query: DropzoneUserProfileDocument,
        variables: {
          dropzoneUserId: dropzoneUser.id,
        },
      },
    ],
    update: async (client, { data }, { variables }) => {
      const c = client.readQuery<DropzoneUsersQuery, DropzoneUsersQueryVariables>({
        query: DropzoneUsersDocument,
        variables: {
          permissions: [variables?.permissionName].filter(Boolean) as Permission[],
          dropzoneId: state.currentDropzoneId?.toString() as string,
        },
      });

      const updatedList = (c?.dropzoneUsers?.edges || []).filter(
        (edge) => edge?.node?.id !== dropzoneUser?.id
      );

      client.writeQuery<DropzoneUsersQuery, DropzoneUsersQueryVariables>({
        query: DropzoneUsersDocument,
        variables: {
          permissions: [variables?.permissionName].filter(Boolean) as Permission[],
          dropzoneId: state.currentDropzoneId?.toString() as string,
        },
        data: {
          ...c,
          dropzoneUsers: {
            edges: updatedList,
          },
        },
      });

      return {
        data: {
          ...c,
          dropzoneUsers: {
            edges: updatedList,
          },
        },
      };
    },
  });
  const [grant] = useGrantPermissionMutation({
    ...mutationHandlers({
      onSuccess: (payload) => {
        dispatch(actions.notifications.showSnackbar({ message: 'Permission granted' }));
      },
      onError: (error) => {
        dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' }));
      },
    }),
    refetchQueries: [
      {
        query: DropzoneUserProfileDocument,
        variables: {
          dropzoneUserId: dropzoneUser.id,
        },
      },
    ],
    update: async (client, { data }, { variables }) => {
      const c = client.readQuery<DropzoneUsersQuery, DropzoneUsersQueryVariables>({
        query: DropzoneUsersDocument,
        variables: {
          permissions: [variables?.permissionName].filter(Boolean) as Permission[],
          dropzoneId: state.currentDropzoneId?.toString() as string,
        },
      });

      const current = c?.dropzoneUsers?.edges || [];
      const shouldUpdate = !!current.find((edge) => edge?.node?.id === dropzoneUser?.id);

      const updatedGcaList = shouldUpdate
        ? [
            ...(c?.dropzoneUsers?.edges || []).map((edge) =>
              edge?.node?.id !== dropzoneUser?.id
                ? edge
                : {
                    ...edge,
                    node: {
                      ...edge?.node,
                      ...data?.grantPermission?.dropzoneUser,
                    },
                  }
            ),
          ]
        : [
            ...(c?.dropzoneUsers?.edges || []),
            {
              node: data?.grantPermission?.dropzoneUser,
            },
          ];
      const newData = {
        ...c,
        dropzoneUsers: {
          edges: updatedGcaList,
        },
      };
      client.writeQuery({
        query: CurrentUserPermissionsDocument,
        variables: {
          dropzoneId: Number(state.currentDropzoneId),
          permissions: [variables?.permissionName],
        },
        data: newData,
      });

      return {
        data: newData,
      };
    },
  });

  const badges = React.useMemo(
    () => permissions?.filter((name) => /^actAs/.test(name)) || [],
    [permissions]
  );

  const shouldShowBadge = React.useCallback(
    (permission: Permission) => canGrantPermission || badges.includes(permission),
    [badges, canGrantPermission]
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
                ? revoke({
                    variables: {
                      permissionName: permission,
                      dropzoneUserId: Number(dropzoneUser?.id),
                    },
                  })
                : grant({
                    variables: {
                      permissionName: permission,
                      dropzoneUserId: Number(dropzoneUser?.id),
                    },
                  })
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
