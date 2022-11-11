import { useAppSignal } from 'app/components/app_signal';
import * as React from 'react';
import {
  CreateOrderMutationVariables,
  DropzoneUserEssentialsFragment,
  DropzoneUserProfileFragment,
  DropzoneUserQueryVariables,
  OrderEssentialsFragment,
  UpdateDropzoneUserMutationVariables,
} from '../operations';
import {
  DropzoneUserProfileFragmentDoc,
  useCreateOrderMutation,
  useDropzoneUserProfileLazyQuery,
  useUpdateDropzoneUserMutation,
} from '../reflection';
import createCRUDContext, { TMutationResponse, uninitializedHandler } from './factory';
import { useDropzoneContext } from './useDropzone';

function useUserProfile(variables?: Partial<DropzoneUserQueryVariables>) {
  const { id } = variables || {};
  const [updateMutation] = useUpdateDropzoneUserMutation();
  const [getProfile, query] = useDropzoneUserProfileLazyQuery();
  const [mutationCreateOrder] = useCreateOrderMutation();
  const { dropzone } = useDropzoneContext();
  const { appSignal } = useAppSignal();

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

  return React.useMemo(
    () => ({
      loading: query?.loading,
      dropzoneUser: query?.data?.dropzoneUser,
      update,
      addCredits,
      withdrawCredits,
    }),
    [addCredits, query?.data?.dropzoneUser, query?.loading, update, withdrawCredits]
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
  }
);

export { UserProfileProvider, useUserProfileContext, useUserProfile };
