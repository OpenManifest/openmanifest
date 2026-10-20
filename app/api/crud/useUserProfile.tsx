import { useAppSignal } from 'app/components/app_signal';
import useRestriction from 'app/hooks/useRestriction';
import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
import { useAuthenticated } from 'app/state';
import {
  AddUserQualificationMutationVariables,
  CreateOrderMutationVariables,
  MembershipEssentialsFragment,
  MembershipProfileFragment,
  MembershipQueryVariables,
  OrderEssentialsFragment,
  UpdateMembershipMutationVariables,
  UpdateUserMutationVariables,
  UserEssentialsFragment,
  UserCertificationEssentialsFragment,
  UserQualificationEssentialsFragment,
} from '../operations';
import {
  MembershipProfileDocument,
  MembershipProfileFragmentDoc,
  MembershipsDocument,
  useCreateGhostMutation,
  useAddUserQualificationMutation,
  useCreateOrderMutation,
  useMembershipProfileLazyQuery,
  useGrantPermissionMutation,
  useJoinCertificationBodyMutation,
  useRevokePermissionMutation,
  useUpdateUserMutation,
} from '../reflection';
import { GhostInput, JoinCertificationBodyInput, Permission } from '../schema.d';
import createCRUDContext, { TMutationResponse, uninitializedHandler } from './factory';
import { useUserUpdated } from './subscriptions/useUserUpdated';
import { toCents } from 'app/utils/money';

function useUserProfile(variables?: Partial<MembershipQueryVariables>) {
  const authenticated = useAuthenticated();
  const { id } = variables || {};
  const [updateMutation] = useUpdateUserMutation();
  const [getProfile, query] = useMembershipProfileLazyQuery();
  const [mutationCreateOrder] = useCreateOrderMutation();
  const [mutationCreateGhost] = useCreateGhostMutation();
  const [updateCertificationBody] = useJoinCertificationBodyMutation();
  const [mutationAddQualification] = useAddUserQualificationMutation();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { appSignal } = useAppSignal();
  const canGrantPermission = useRestriction(Permission.GrantPermission);
  const canRevokePermission = useRestriction(Permission.RevokePermission);

  const profile = React.useMemo(() => query?.data?.membership, [query?.data?.membership]);
  useUserUpdated(profile?.id);

  React.useEffect(() => {
    if (authenticated && id && id !== query?.variables?.id) {
      getProfile({ variables: { id } });
    }
  }, [authenticated, getProfile, id, query?.variables?.id]);

  const create = React.useCallback(
    async function CreateGhost(
      attributes: GhostInput
    ): Promise<TMutationResponse<{ user: UserEssentialsFragment }>> {
      try {
        const response = await mutationCreateGhost({
          variables: attributes,
          refetchQueries: [
            MembershipsDocument,
            { query: MembershipsDocument, variables: { operatorId: operator?.id } },
          ],
        });

        if (response?.data?.createGhost?.user?.id) {
          return { user: response?.data?.createGhost?.user };
        }
        return {
          error: response?.data?.createGhost?.errors?.[0],
          fieldErrors: response?.data?.createGhost?.fieldErrors || undefined,
        };
      } catch (error) {
        if (error instanceof Error) {
          appSignal?.sendError(error);
        }
        return { error: 'Oh no, something went wrong' };
      }
    },
    [appSignal, operator?.id, mutationCreateGhost]
  );
  const update = React.useCallback(
    async function UpdateUser(
      attributes: UpdateUserMutationVariables
    ): Promise<TMutationResponse<{ membership: MembershipProfileFragment }>> {
      const { data } = await updateMutation({
        variables: {
          membership: query?.data?.membership?.id,
          ...attributes,
        },
      });

      if (data?.updateUser?.membership?.id) {
        return { membership: data?.updateUser?.membership };
      }

      return {
        error: data?.updateUser?.errors?.[0],
        fieldErrors: data?.updateUser?.fieldErrors || undefined,
      };
    },
    [query?.data?.membership?.id, updateMutation]
  );

  const joinCertificationBody = React.useCallback(
    async function JoinCertificationBody(
      attributes: JoinCertificationBodyInput['attributes']
    ): Promise<TMutationResponse<{ userCertification: UserCertificationEssentialsFragment }>> {
      const { data } = await updateCertificationBody({
        variables: attributes,
      });

      if (data?.joinCertificationBody?.userCertification?.id) {
        return { userCertification: data?.joinCertificationBody?.userCertification };
      }

      return {
        error: data?.joinCertificationBody?.errors?.[0],
        fieldErrors: data?.joinCertificationBody?.fieldErrors || undefined,
      };
    },
    [updateCertificationBody]
  );

  const addQualification = React.useCallback(
    async function AddQualification(
      attributes: AddUserQualificationMutationVariables
    ): Promise<TMutationResponse<{ userQualification: UserQualificationEssentialsFragment }>> {
      const { data } = await mutationAddQualification({
        variables: attributes,
        refetchQueries: query?.variables?.id
          ? [{ query: MembershipProfileDocument, variables: { id: query.variables.id } }]
          : [],
      });

      if (data?.addUserQualification?.userQualification?.id) {
        return { userQualification: data.addUserQualification.userQualification };
      }

      return {
        error: data?.addUserQualification?.errors?.[0],
        fieldErrors: data?.addUserQualification?.fieldErrors || undefined,
      };
    },
    [mutationAddQualification, query?.variables?.id]
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

              if (order?.buyer?.__typename === 'Membership') {
                // Deduct credits
                cache.writeFragment({
                  fragment: MembershipProfileFragmentDoc,
                  fragmentName: 'membershipProfile',
                  id: cache.identify(order.buyer),
                  data: order.buyer,
                });
              } else if (order?.seller?.__typename === 'Membership') {
                // Add credits
                cache.writeFragment({
                  fragment: MembershipProfileFragmentDoc,
                  fragmentName: 'membershipProfile',
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
      membership: MembershipEssentialsFragment,
      { amount, message }: { amount: number; message?: string | null }
    ): ReturnType<typeof createOrder> {
      if (!operator) {
        return { error: 'No dropzone selected' };
      }
      return createOrder({
        amountCents: toCents(amount),
        title: message || 'Added funds',
        seller: membership.walletId,
        buyer: operator.walletId,
        operator: operator.id,
      });
    },
    [createOrder, operator]
  );

  const withdrawCredits = React.useCallback(
    async function DeductCredits(
      membership: MembershipEssentialsFragment,
      { amount, message }: { amount: number; message?: string | null }
    ): ReturnType<typeof createOrder> {
      if (!operator) {
        return { error: 'No dropzone selected' };
      }
      return createOrder({
        amountCents: toCents(amount),
        title: message || 'Withdrew funds',
        buyer: membership.walletId,
        seller: operator.walletId,
        operator: operator.id,
      });
    },
    [createOrder, operator]
  );

  const [revoke] = useRevokePermissionMutation();
  const [grant] = useGrantPermissionMutation();

  const grantPermission = React.useCallback(
    async function GrantPermission(
      membershipId: string,
      permissionName: Permission
    ): Promise<TMutationResponse<{ membership: MembershipProfileFragment }>> {
      if (!canGrantPermission) {
        return { error: 'You cannot grant permissions' };
      }
      const { data } = await grant({
        variables: {
          membershipId,
          permissionName,
        },
        refetchQueries: [
          {
            query: MembershipsDocument,
            variables: { operatorId: operator?.id, permissions: [permissionName] },
          },
          {
            query: MembershipProfileDocument,
            variables: {
              membershipId,
            },
          },
        ],
      });

      if (data?.grantPermission?.membership?.id) {
        return {
          membership: data?.grantPermission?.membership,
        };
      }
      return {
        error: data?.grantPermission?.errors?.[0],
        fieldErrors: data?.grantPermission?.fieldErrors || undefined,
      };
    },
    [canGrantPermission, operator?.id, grant]
  );

  const revokePermission = React.useCallback(
    async function RevokePermission(
      membershipId: string,
      permissionName: Permission
    ): Promise<TMutationResponse<{ membership: MembershipProfileFragment }>> {
      if (!canRevokePermission) {
        return { error: 'You cannot revoke permissions' };
      }
      const { data } = await revoke({
        variables: {
          membershipId,
          permissionName,
        },
        refetchQueries: [
          {
            query: MembershipsDocument,
            variables: { operatorId: operator?.id, permissions: [permissionName] },
          },
          {
            query: MembershipProfileDocument,
            variables: {
              membershipId,
            },
          },
        ],
      });

      if (data?.revokePermission?.membership?.id) {
        return {
          membership: data?.revokePermission?.membership,
        };
      }
      return {
        error: data?.revokePermission?.errors?.[0],
        fieldErrors: data?.revokePermission?.fieldErrors || undefined,
      };
    },
    [canRevokePermission, operator?.id, revoke]
  );

  return React.useMemo(
    () => ({
      loading: query?.loading,
      membership: query?.data?.membership,
      refetch: query?.refetch,
      create,
      update,
      addCredits,
      grantPermission,
      joinCertificationBody,
      addQualification,
      revokePermission,
      withdrawCredits,
    }),
    [
      addCredits,
      grantPermission,
      joinCertificationBody,
      addQualification,
      query?.refetch,
      create,
      query?.data?.membership,
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
    membership: null,
    joinCertificationBody: uninitializedHandler as never,
    addQualification: uninitializedHandler as never,
    refetch: uninitializedHandler as never,
    update: uninitializedHandler as never,
    create: uninitializedHandler as never,
    addCredits: uninitializedHandler as never,
    withdrawCredits: uninitializedHandler as never,
    grantPermission: uninitializedHandler as never,
    revokePermission: uninitializedHandler as never,
  }
);

export { UserProfileProvider, useUserProfileContext, useUserProfile };
