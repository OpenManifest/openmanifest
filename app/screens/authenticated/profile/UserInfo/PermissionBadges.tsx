import { useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import startOfDay from 'date-fns/startOfDay';
import { ScrollView } from 'react-native-gesture-handler';
import { QUERY_DROPZONE_USERS } from 'app/api/hooks/useQueryDropzoneUsers';
import { QUERY_PERMISSION_USER } from 'app/components/chips/GcaChip';

import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { DropzoneUser, Permission, Query } from 'app/api/schema.d';

import { QueryDropzoneDocument } from 'app/api/reflection';
// eslint-disable-next-line max-len
import { QUERY_DROPZONE_USER_PROFILE } from 'app/api/hooks/useDropzoneUserProfile';
import Badge, { IBadgeProps } from 'app/components/Badge';
import useRestriction from 'app/hooks/useRestriction';
import useMutationRevokePermission from 'app/api/hooks/useMutationRevokePermission';
import useMutationGrantPermission from 'app/api/hooks/useMutationGrantPermission';

interface IPermissionBadgesProps {
  permissions: Permission[];
  dropzoneUser: DropzoneUser;
}
export default function PermissionBadges(props: IPermissionBadgesProps) {
  const { permissions, dropzoneUser } = props;
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();

  const canGrantPermission = useRestriction(Permission.GrantPermission);

  const revokePermission = useMutationRevokePermission({
    onSuccess: (payload) => {
      dispatch(actions.notifications.showSnackbar({ message: 'Permission revoked' }));
    },
    onError: (error) => {
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' }));
    },
    mutation: {
      refetchQueries: [
        {
          query: QueryDropzoneDocument,
          variables: {
            dropzoneId: state.currentDropzoneId,
            earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
          },
        },
        {
          query: QUERY_DROPZONE_USER_PROFILE,
          variables: {
            dropzoneId: state.currentDropzoneId,
            dropzoneUserId: Number(route.params.userId),
          },
        },
      ],
    },
  });
  const grantPermission = useMutationGrantPermission({
    onSuccess: (payload) => {
      dispatch(actions.notifications.showSnackbar({ message: 'Permission granted' }));
    },
    onError: (error) => {
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' }));
    },
    mutation: {
      refetchQueries: [
        {
          query: QueryDropzoneDocument,
          variables: {
            dropzoneId: state.currentDropzoneId,
            earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
          },
        },
        {
          query: QUERY_DROPZONE_USER_PROFILE,
          variables: {
            dropzoneId: state.currentDropzoneId,
            dropzoneUserId: Number(route.params.userId),
          },
        },
      ],
    },
  });

  const badges = permissions?.filter((name) => /^actAs/.test(name)) || [];

  const shouldShowBadge = (permission: Permission) =>
    canGrantPermission || badges.includes(permission);

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
                ? revokePermission.mutate(
                    {
                      permissionName: permission,
                      dropzoneUserId: Number(dropzoneUser?.id),
                    },
                    {
                      refetchQueries: [
                        {
                          query: QUERY_DROPZONE_USERS,
                          variables: {
                            dropzoneId: state.currentDropzoneId,
                            permissions: [permission],
                          },
                        },
                      ],
                      update: async (client, { data }) => {
                        const c = client.readQuery<Query>({
                          query: QUERY_PERMISSION_USER,
                          variables: {
                            permissions: [permission],
                            dropzoneId: Number(state.currentDropzoneId),
                          },
                        });

                        const updatedList = (c?.dropzone?.dropzoneUsers?.edges || []).filter(
                          (edge) => edge?.node?.id !== dropzoneUser?.id
                        );

                        client.writeQuery({
                          query: QUERY_PERMISSION_USER,
                          variables: {
                            permissions: [permission],
                            dropzoneId: Number(state.currentDropzoneId),
                          },
                          data: {
                            ...c,
                            dropzone: {
                              ...c?.dropzone,
                              dropzoneUsers: {
                                edges: updatedList,
                              },
                            },
                          },
                        });

                        return {
                          data: {
                            ...c,
                            dropzone: {
                              ...c?.dropzone,
                              dropzoneUsers: {
                                edges: updatedList,
                              },
                            },
                          },
                        };
                      },
                    }
                  )
                : grantPermission.mutate(
                    {
                      permissionName: permission,
                      dropzoneUserId: Number(dropzoneUser?.id),
                    },
                    {
                      refetchQueries: [
                        {
                          query: QUERY_DROPZONE_USERS,
                          variables: {
                            dropzoneId: state.currentDropzoneId,
                            permissions: [permission],
                          },
                        },
                      ],
                      update: async (client, { data }) => {
                        const c = client.readQuery<Query>({
                          query: QUERY_PERMISSION_USER,
                          variables: {
                            permissions: [permission],
                            dropzoneId: Number(state.currentDropzoneId),
                          },
                        });

                        const current = c?.dropzone?.dropzoneUsers?.edges || [];
                        const shouldUpdate = !!current.find(
                          (edge) => edge?.node?.id === dropzoneUser?.id
                        );

                        const updatedGcaList = shouldUpdate
                          ? [
                              ...(c?.dropzone?.dropzoneUsers?.edges || []).map((edge) =>
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
                              ...(c?.dropzone?.dropzoneUsers?.edges || []),
                              {
                                node: data?.grantPermission?.dropzoneUser,
                              },
                            ];
                        const newData = {
                          ...c,
                          dropzone: {
                            ...c?.dropzone,
                            dropzoneUsers: {
                              edges: updatedGcaList,
                            },
                          },
                        };
                        client.writeQuery({
                          query: QUERY_PERMISSION_USER,
                          variables: {
                            dropzoneId: Number(state.currentDropzoneId),
                            permissions: [permission],
                          },
                          data: newData,
                        });

                        return {
                          data: newData,
                        };
                      },
                    }
                  )
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
