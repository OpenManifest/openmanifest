import { useAppSignal } from 'app/components/app_signal';
import useRestriction from 'app/hooks/useRestriction';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone';
import {
  CreateOrderMutationVariables,
  DropzoneUserEssentialsFragment,
  DropzoneUserProfileFragment,
  DropzoneUserQueryVariables,
  OrderEssentialsFragment,
  UpdateDropzoneUserMutationVariables,
} from '../operations';
import {
  DropzoneUserProfileDocument,
  DropzoneUserProfileFragmentDoc,
  DropzoneUsersDocument,
  useCreateOrderMutation,
  useDropzoneUserProfileLazyQuery,
  useGrantPermissionMutation,
  useRevokePermissionMutation,
  useUpdateDropzoneUserMutation,
} from '../reflection';
import { Permission } from '../schema.d';
import createCRUDContext, { TMutationResponse, uninitializedHandler } from './factory';

function useUserProfile(variables?: Partial<DropzoneUserQueryVariables>) {
  const { id } = variables || {};
  const [updateMutation] = useUpdateDropzoneUserMutation();
  const [getProfile, query] = useDropzoneUserProfileLazyQuery();
  const [mutationCreateOrder] = useCreateOrderMutation();
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const { appSignal } = useAppSignal();
  const canGrantPermission = useRestriction(Permission.GrantPermission);
  const canRevokePermission = useRestriction(Permission.RevokePermission);

  React.useEffect(() => {
    if (id && id === query?.variables?.id) {
      getProfile({ variables: { id: id.toString() } });
    }
  }, [getProfile, id, query?.variables?.id]);

  const update = React.useCallback(
    async function UpdateDropzoneUser(
      attributes: UpdateDropzoneUserMutationVariables
    ): Promise<TMutationResponse<{ dropzoneUser: DropzoneUserProfileFragment }>> {
      const { data } = await updateMutation({
        variables: {
          ...attributes,
        },
      });

      if (data?.updateDropzoneUser?.dropzoneUser?.id) {
        return { dropzoneUser: data?.updateDropzoneUser?.dropzoneUser };
      }

      return {
        error: data?.updateDropzoneUser?.errors?.[0],
        fieldErrors: data?.updateDropzoneUser?.fieldErrors || undefined,
      };
    },
    [updateMutation]
  );

  const createOrder = React.useCallback(
    async function CreateOrder(
      attributes: CreateOrderMutationVariables
    ): Promise<TMutationResponse<{ order: OrderEssentialsFragment }>> {
      try {
        const { data } = await mutationCreateOrder({
          variables: {
            ...attributes,
          },
          update: (cache, { data: mutationResult }) => {
            if (mutationResult?.createOrder?.order?.id) {
              const { order } = mutationResult.createOrder;

              if (order.buyer.__typename === 'DropzoneUser') {
                // Deduct credits
                cache.writeFragment({
                  fragment: DropzoneUserProfileFragmentDoc,
                  fragmentName: 'dropzoneUserProfile',
                  id: cache.identify(order.buyer),
                  data: order.buyer,
                });
              } else if (order.seller.__typename === 'DropzoneUser') {
                // Add credits
                cache.writeFragment({
                  fragment: DropzoneUserProfileFragmentDoc,
                  fragmentName: 'dropzoneUserProfile',
                  id: cache.identify(order.seller),
                  data: order.seller,
                });
              }
            }
          },
        });
        if (data?.createOrder?.order?.id) {
          return { order: data?.createOrder?.order };
        }

        return {
          error: data?.createOrder?.errors?.[0],
          fieldErrors: data?.createOrder?.fieldErrors || undefined,
        };
      } catch (error) {
        appSignal.sendError(error as Error);
        return { error: 'Something went wrong' };
      }
    },
    [appSignal, mutationCreateOrder]
  );

  const addCredits = React.useCallback(
    async function AddCredits(
      dropzoneUser: DropzoneUserEssentialsFragment,
      { amount, message }: { amount: number; message?: string | null }
    ): ReturnType<typeof createOrder> {
      if (!dropzone) {
        return { error: 'No dropzone selected' };
      }
      return createOrder({
        amount,
        title: message || `Added funds`,
        seller: dropzoneUser.walletId,
        buyer: dropzone.walletId,
        dropzone: dropzone.id,
      });
    },
    [createOrder, dropzone]
  );

  const withdrawCredits = React.useCallback(
    async function DeductCredits(
      dropzoneUser: DropzoneUserEssentialsFragment,
      { amount, message }: { amount: number; message?: string | null }
    ): ReturnType<typeof createOrder> {
      if (!dropzone) {
        return { error: 'No dropzone selected' };
      }
      return createOrder({
        amount,
        title: message || `Withdrew funds`,
        buyer: dropzoneUser.walletId,
        seller: dropzone.walletId,
        dropzone: dropzone.id,
      });
    },
    [createOrder, dropzone]
  );

  const [revoke] = useRevokePermissionMutation();
  const [grant] = useGrantPermissionMutation();

  const grantPermission = React.useCallback(
    async function GrantPermission(
      dropzoneUserId: string,
      permissionName: Permission
    ): Promise<TMutationResponse<{ dropzoneUser: DropzoneUserProfileFragment }>> {
      if (!canGrantPermission) {
        return { error: 'You cannot grant permissions' };
      }
      const { data } = await grant({
        variables: {
          dropzoneUserId: Number(dropzoneUserId),
          permissionName,
        },
        refetchQueries: [
          {
            query: DropzoneUsersDocument,
            variables: { dropzoneId: dropzone?.id, permissions: [permissionName] },
          },
          {
            query: DropzoneUserProfileDocument,
            variables: {
              dropzoneUserId,
            },
          },
        ],
      });

      if (data?.grantPermission?.dropzoneUser?.id) {
        return {
          dropzoneUser: data?.grantPermission?.dropzoneUser,
        };
      }
      return {
        error: data?.grantPermission?.errors?.[0],
        fieldErrors: data?.grantPermission?.fieldErrors || undefined,
      };
    },
    [canGrantPermission, dropzone?.id, grant]
  );

  const revokePermission = React.useCallback(
    async function revokePermission(
      dropzoneUserId: string,
      permissionName: Permission
    ): Promise<TMutationResponse<{ dropzoneUser: DropzoneUserProfileFragment }>> {
      if (!canRevokePermission) {
        return { error: 'You cannot revoke permissions' };
      }
      const { data } = await revoke({
        variables: {
          dropzoneUserId: Number(dropzoneUserId),
          permissionName,
        },
        refetchQueries: [
          {
            query: DropzoneUsersDocument,
            variables: { dropzoneId: dropzone?.id, permissions: [permissionName] },
          },
          {
            query: DropzoneUserProfileDocument,
            variables: {
              dropzoneUserId,
            },
          },
        ],
      });

      if (data?.revokePermission?.dropzoneUser?.id) {
        return {
          dropzoneUser: data?.revokePermission?.dropzoneUser,
        };
      }
      return {
        error: data?.revokePermission?.errors?.[0],
        fieldErrors: data?.revokePermission?.fieldErrors || undefined,
      };
    },
    [canRevokePermission, dropzone?.id, revoke]
  );

  return React.useMemo(
    () => ({
      loading: query?.loading,
      dropzoneUser: query?.data?.dropzoneUser,
      update,
      addCredits,
      grantPermission,
      revokePermission,
      withdrawCredits,
    }),
    [
      addCredits,
      grantPermission,
      query?.data?.dropzoneUser,
      query?.loading,
      revokePermission,
      update,
      withdrawCredits,
    ]
  );
}

const { Provider: UserProfileProvider, useContext: useUserProfileContext } = createCRUDContext(
  useUserProfile,
  {
    loading: false,
    dropzoneUser: null,
    update: uninitializedHandler as never,
    addCredits: uninitializedHandler as never,
    withdrawCredits: uninitializedHandler as never,
    grantPermission: uninitializedHandler as never,
    revokePermission: uninitializedHandler as never,
  }
);

export { UserProfileProvider, useUserProfileContext, useUserProfile };
