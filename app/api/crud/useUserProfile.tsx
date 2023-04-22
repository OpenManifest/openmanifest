import { useAppSignal } from 'app/components/app_signal';
import useRestriction from 'app/hooks/useRestriction';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useAppSelector } from 'app/state';
import {
  CreateOrderMutationVariables,
  DropzoneUserEssentialsFragment,
  DropzoneUserProfileFragment,
  DropzoneUserQueryVariables,
  OrderEssentialsFragment,
  UpdateDropzoneUserMutationVariables,
  UpdateUserMutationVariables,
  UserEssentialsFragment,
  UserFederationEssentialsFragment
} from '../operations';
import {
  DropzoneUserProfileDocument,
  DropzoneUserProfileFragmentDoc,
  DropzoneUsersDocument,
  useCreateGhostMutation,
  useCreateOrderMutation,
  useDropzoneUserProfileLazyQuery,
  useGrantPermissionMutation,
  useJoinFederationMutation,
  useRevokePermissionMutation,
  useUpdateUserMutation
} from '../reflection';
import { GhostInput, JoinFederationInput, Permission } from '../schema.d';
import createCRUDContext, { TMutationResponse, uninitializedHandler } from './factory';
import { useUserUpdated } from './subscriptions/useUserUpdated';

function useUserProfile(variables?: Partial<DropzoneUserQueryVariables>) {
  const { authenticated } = useAppSelector((root) => root.global);
  const { id } = variables || {};
  const [updateMutation] = useUpdateUserMutation();
  const [getProfile, query] = useDropzoneUserProfileLazyQuery();
  const [mutationCreateOrder] = useCreateOrderMutation();
  const [mutationCreateGhost] = useCreateGhostMutation();
  const [updateFederation] = useJoinFederationMutation();
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();
  const { appSignal } = useAppSignal();
  const canGrantPermission = useRestriction(Permission.GrantPermission);
  const canRevokePermission = useRestriction(Permission.RevokePermission);

  const profile = React.useMemo(() => query?.data?.dropzoneUser, [query?.data?.dropzoneUser]);
  useUserUpdated(profile?.id);

  React.useEffect(() => {
    if (authenticated && id && id !== query?.variables?.id) {
      getProfile({ variables: { id } });
    }
  }, [authenticated, getProfile, id, query?.variables?.id]);

  const create = React.useCallback(
    async function CreateGhost(attributes: GhostInput): Promise<TMutationResponse<{ user: UserEssentialsFragment }>> {
      try {
        const response = await mutationCreateGhost({
          variables: attributes,
          refetchQueries: [
            DropzoneUsersDocument,
            { query: DropzoneUsersDocument, variables: { dropzoneId: dropzone?.id } }
          ]
        });

        if (response?.data?.createGhost?.user?.id) {
          return { user: response?.data?.createGhost?.user };
        }
        return {
          error: response?.data?.createGhost?.errors?.[0],
          fieldErrors: response?.data?.createGhost?.fieldErrors || undefined
        };
      } catch (error) {
        console.debug('CreateGhost failed', error);
        if (error instanceof Error) {
          appSignal?.sendError(error);
        }
        return { error: 'Oh no, something went wrong' };
      }
    },
    [appSignal, dropzone?.id, mutationCreateGhost]
  );
  const update = React.useCallback(
    async function UpdateUser(
      attributes: UpdateUserMutationVariables
    ): Promise<TMutationResponse<{ dropzoneUser: DropzoneUserProfileFragment }>> {
      const { data } = await updateMutation({
        variables: {
          dropzoneUser: query?.data?.dropzoneUser?.id,
          ...attributes
        }
      });

      if (data?.updateUser?.dropzoneUser?.id) {
        return { dropzoneUser: data?.updateUser?.dropzoneUser };
      }

      return {
        error: data?.updateUser?.errors?.[0],
        fieldErrors: data?.updateUser?.fieldErrors || undefined
      };
    },
    [query?.data?.dropzoneUser?.id, updateMutation]
  );

  const joinFederation = React.useCallback(
    async function JoinFederation(
      attributes: JoinFederationInput['attributes']
    ): Promise<TMutationResponse<{ userFederation: UserFederationEssentialsFragment }>> {
      const { data } = await updateFederation({
        variables: attributes
      });

      if (data?.joinFederation?.userFederation?.id) {
        return { userFederation: data?.joinFederation?.userFederation };
      }

      return {
        error: data?.joinFederation?.errors?.[0],
        fieldErrors: data?.joinFederation?.fieldErrors || undefined
      };
    },
    [updateFederation]
  );

  const createOrder = React.useCallback(
    async function CreateOrder(
      attributes: CreateOrderMutationVariables
    ): Promise<TMutationResponse<{ order: OrderEssentialsFragment }>> {
      try {
        const { data } = await mutationCreateOrder({
          variables: {
            ...attributes
          },
          update: (cache, { data: mutationResult }) => {
            if (mutationResult?.createOrder?.order?.id) {
              const { order } = mutationResult.createOrder;

              if (order?.buyer?.__typename === 'DropzoneUser') {
                // Deduct credits
                cache.writeFragment({
                  fragment: DropzoneUserProfileFragmentDoc,
                  fragmentName: 'dropzoneUserProfile',
                  id: cache.identify(order.buyer),
                  data: order.buyer
                });
              } else if (order?.seller?.__typename === 'DropzoneUser') {
                // Add credits
                cache.writeFragment({
                  fragment: DropzoneUserProfileFragmentDoc,
                  fragmentName: 'dropzoneUserProfile',
                  id: cache.identify(order.seller),
                  data: order.seller
                });
              }
            }
          }
        });
        if (data?.createOrder?.order?.id) {
          return { order: data?.createOrder?.order };
        }

        return {
          error: data?.createOrder?.errors?.[0],
          fieldErrors: data?.createOrder?.fieldErrors || undefined
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
        title: message || 'Added funds',
        seller: dropzoneUser.walletId,
        buyer: dropzone.walletId,
        dropzone: dropzone.id
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
        title: message || 'Withdrew funds',
        buyer: dropzoneUser.walletId,
        seller: dropzone.walletId,
        dropzone: dropzone.id
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
          dropzoneUserId,
          permissionName
        },
        refetchQueries: [
          {
            query: DropzoneUsersDocument,
            variables: { dropzoneId: dropzone?.id, permissions: [permissionName] }
          },
          {
            query: DropzoneUserProfileDocument,
            variables: {
              dropzoneUserId
            }
          }
        ]
      });

      if (data?.grantPermission?.dropzoneUser?.id) {
        return {
          dropzoneUser: data?.grantPermission?.dropzoneUser
        };
      }
      return {
        error: data?.grantPermission?.errors?.[0],
        fieldErrors: data?.grantPermission?.fieldErrors || undefined
      };
    },
    [canGrantPermission, dropzone?.id, grant]
  );

  const revokePermission = React.useCallback(
    async function RevokePermission(
      dropzoneUserId: string,
      permissionName: Permission
    ): Promise<TMutationResponse<{ dropzoneUser: DropzoneUserProfileFragment }>> {
      if (!canRevokePermission) {
        return { error: 'You cannot revoke permissions' };
      }
      const { data } = await revoke({
        variables: {
          dropzoneUserId,
          permissionName
        },
        refetchQueries: [
          {
            query: DropzoneUsersDocument,
            variables: { dropzoneId: dropzone?.id, permissions: [permissionName] }
          },
          {
            query: DropzoneUserProfileDocument,
            variables: {
              dropzoneUserId
            }
          }
        ]
      });

      if (data?.revokePermission?.dropzoneUser?.id) {
        return {
          dropzoneUser: data?.revokePermission?.dropzoneUser
        };
      }
      return {
        error: data?.revokePermission?.errors?.[0],
        fieldErrors: data?.revokePermission?.fieldErrors || undefined
      };
    },
    [canRevokePermission, dropzone?.id, revoke]
  );

  return React.useMemo(
    () => ({
      loading: query?.loading,
      dropzoneUser: query?.data?.dropzoneUser,
      refetch: query?.refetch,
      create,
      update,
      addCredits,
      grantPermission,
      joinFederation,
      revokePermission,
      withdrawCredits
    }),
    [
      addCredits,
      grantPermission,
      joinFederation,
      query?.refetch,
      create,
      query?.data?.dropzoneUser,
      query?.loading,
      revokePermission,
      update,
      withdrawCredits
    ]
  );
}

const { Provider: UserProfileProvider, useContext: useUserProfileContext } = createCRUDContext(useUserProfile, {
  loading: false,
  dropzoneUser: null,
  joinFederation: uninitializedHandler as never,
  refetch: uninitializedHandler as never,
  update: uninitializedHandler as never,
  create: uninitializedHandler as never,
  addCredits: uninitializedHandler as never,
  withdrawCredits: uninitializedHandler as never,
  grantPermission: uninitializedHandler as never,
  revokePermission: uninitializedHandler as never
});

export { UserProfileProvider, useUserProfileContext, useUserProfile };
