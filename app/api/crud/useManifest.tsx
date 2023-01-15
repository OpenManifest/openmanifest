import * as React from 'react';
import { useAppSelector } from 'app/state';
import { DateTime } from 'luxon';
import useRestriction from 'app/hooks/useRestriction';
import {
  useLoadsQuery,
  useManifestGroupMutation,
  useManifestUserMutation,
  useMoveSlotMutation,
  useDeleteSlotMutation,
  useCreateLoadMutation,
  LoadDocument,
} from '../reflection';
import {
  CreateLoadMutationVariables,
  DeleteSlotMutationVariables,
  LoadDetailsFragment,
  LoadsQueryVariables,
  ManifestGroupMutationVariables,
  ManifestUserMutationVariables,
  MoveSlotMutationVariables,
  SlotExhaustiveFragment,
} from '../operations';
import { TMutationResponse } from './factory';
import { Permission } from '../schema.d';

export type UseManifestOptions = Partial<LoadsQueryVariables>;

export default function useManifest({ dropzone, date }: UseManifestOptions) {
  const state = useAppSelector((root) => root.global);

  const canCreateLoad = useRestriction(Permission.CreateLoad);
  const canDeleteOwnSlot = useRestriction(Permission.DeleteSlot);
  const canDeleteSlot = useRestriction(Permission.DeleteUserSlot);
  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);
  const canUpdateSlot = useRestriction(Permission.UpdateSlot);
  const canUpdateOwnSlot = useRestriction(Permission.UpdateUserSlot);
  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const permissions = React.useMemo(
    () => ({
      canAddTransaction,
      canCreateLoad,
      canDeleteOwnSlot,
      canDeleteSlot,
      canManifestSelf,
      canManifestOthers,
      canUpdateSlot,
      canUpdateOwnSlot,
    }),
    [
      canAddTransaction,
      canCreateLoad,
      canDeleteOwnSlot,
      canDeleteSlot,
      canManifestOthers,
      canManifestSelf,
      canUpdateOwnSlot,
      canUpdateSlot,
    ]
  );

  const variables: LoadsQueryVariables | undefined = React.useMemo(() => {
    if (!dropzone) {
      return undefined;
    }
    return {
      dropzone,
      date: date || DateTime.local().toISODate(),
    };
  }, [date, dropzone]);

  const query = useLoadsQuery({
    initialFetchPolicy: 'cache-first',
    variables,
    skip: !state?.credentials?.accessToken || !dropzone,
  });

  const [moveSlotMutation] = useMoveSlotMutation();
  const [deleteSlotMutation] = useDeleteSlotMutation();
  const [manifestGroupMutation] = useManifestGroupMutation();
  const [manifestUserMutation] = useManifestUserMutation();
  const [createLoadMutation] = useCreateLoadMutation();

  const { loading, fetchMore, refetch, data, called, updateQuery } = query;

  const moveSlot = React.useCallback(
    async function MoveSlot(
      sourceLoad: string,
      mutationVariables: MoveSlotMutationVariables
    ): Promise<TMutationResponse<{ loads: LoadDetailsFragment[] }>> {
      const result = await moveSlotMutation({
        variables: mutationVariables,
        refetchQueries: [
          { query: LoadDocument, variables: { id: sourceLoad } },
          { query: LoadDocument, variables: { id: mutationVariables?.targetLoad?.toString() } },
        ],
      });

      if (result?.data?.moveSlot?.fieldErrors?.length || result?.data?.moveSlot?.errors?.length) {
        return {
          error: result?.data?.moveSlot?.errors?.[0],
          fieldErrors: result?.data?.moveSlot?.fieldErrors || undefined,
        };
      }
      if (result.data?.moveSlot?.loads) {
        return {
          loads: result.data.moveSlot.loads,
        };
      }
      return {
        error: result?.errors?.[0]?.message,
        fieldErrors: undefined,
      };
    },
    [moveSlotMutation]
  );

  const manifestUser = React.useCallback(
    async function ManifestUser(
      mutationVariables: ManifestUserMutationVariables
    ): Promise<TMutationResponse<{ slot: SlotExhaustiveFragment }>> {
      const result = await manifestUserMutation({ variables: mutationVariables });

      if (
        result?.data?.createSlot?.fieldErrors?.length ||
        result?.data?.createSlot?.errors?.length
      ) {
        return {
          error: result?.data?.createSlot?.errors?.[0],
          fieldErrors: result?.data?.createSlot?.fieldErrors || undefined,
        };
      }
      if (result.data?.createSlot?.slot) {
        return {
          slot: result.data.createSlot.slot,
        };
      }
      return {
        error: result?.errors?.[0]?.message,
        fieldErrors: undefined,
      };
    },
    [manifestUserMutation]
  );

  const manifestGroup = React.useCallback(
    async function ManifestGroup(
      mutationVariables: ManifestGroupMutationVariables
    ): Promise<TMutationResponse<{ load: LoadDetailsFragment }>> {
      const result = await manifestGroupMutation({ variables: mutationVariables });

      if (
        result?.data?.createSlots?.fieldErrors?.length ||
        result?.data?.createSlots?.errors?.length
      ) {
        return {
          error: result?.data?.createSlots?.errors?.[0],
          fieldErrors: result?.data?.createSlots?.fieldErrors || undefined,
        };
      }
      if (result.data?.createSlots?.load?.id) {
        return {
          load: result.data.createSlots.load,
        };
      }
      return {
        error: result?.errors?.[0]?.message,
        fieldErrors: undefined,
      };
    },
    [manifestGroupMutation]
  );

  const deleteSlot = React.useCallback(
    async function DeleteSlot(
      mutationVariables: DeleteSlotMutationVariables
    ): Promise<TMutationResponse<{ slot: SlotExhaustiveFragment }>> {
      const result = await deleteSlotMutation({ variables: mutationVariables });

      if (
        result?.data?.deleteSlot?.fieldErrors?.length ||
        result?.data?.deleteSlot?.errors?.length
      ) {
        return {
          error: result?.data?.deleteSlot?.errors?.[0],
          fieldErrors: result?.data?.deleteSlot?.fieldErrors || undefined,
        };
      }
      if (result.data?.deleteSlot?.slot?.id) {
        return {
          slot: result.data.deleteSlot?.slot,
        };
      }
      return {
        error: result?.errors?.[0]?.message,
        fieldErrors: undefined,
      };
    },
    [deleteSlotMutation]
  );

  const createLoad = React.useCallback(
    async function CreateLoad(
      mutationVariables: CreateLoadMutationVariables
    ): Promise<TMutationResponse<{ load: LoadDetailsFragment }>> {
      const result = await createLoadMutation({ variables: mutationVariables });

      if (
        result?.data?.createLoad?.fieldErrors?.length ||
        result?.data?.createLoad?.errors?.length
      ) {
        return {
          error: result?.data?.createLoad?.errors?.[0],
          fieldErrors: result?.data?.createLoad?.fieldErrors || undefined,
        };
      }
      if (result?.data?.createLoad?.load?.id) {
        const { load } = result.data.createLoad;
        updateQuery((prev) => ({
          ...prev,
          loads: {
            ...prev?.loads,
            edges: [{ node: load, __typename: 'LoadEdge' }, ...(prev?.loads?.edges || [])],
          },
        }));
        return {
          load: result.data.createLoad.load,
        };
      }
      return {
        error: result?.errors?.[0]?.message,
        fieldErrors: undefined,
      };
    },
    [createLoadMutation, updateQuery]
  );

  return React.useMemo(
    () => ({
      loading,
      called,
      refetch,
      fetchMore,
      moveSlot,
      manifestUser,
      manifestGroup,
      deleteSlot,
      createLoad,
      permissions,
      loads: data?.loads?.edges?.map((edge) => edge?.node) || [],
    }),
    [
      called,
      createLoad,
      data?.loads?.edges,
      deleteSlot,
      fetchMore,
      loading,
      permissions,
      manifestGroup,
      manifestUser,
      moveSlot,
      refetch,
    ]
  );
}

export { useManifest };
