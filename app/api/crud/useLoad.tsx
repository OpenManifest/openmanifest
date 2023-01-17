import * as React from 'react';
import { isEqual, noop } from 'lodash';
import { DateTime } from 'luxon';
import useRestriction from 'app/hooks/useRestriction';
import * as yup from 'yup';
import { ValidationError } from 'yup';
import { useNotifications } from 'app/providers/notifications';
import { useAppSelector } from 'app/state';
import {
  useFinalizeLoadMutation,
  useLoadLazyQuery,
  useManifestUserMutation,
  useUpdateLoadMutation,
} from '../reflection';
import {
  LoadDetailsFragment,
  LoadQueryVariables,
  UpdateLoadMutationVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';
import { CreateSlotPayload, LoadState, Permission } from '../schema.d';
import { useLoadUpdated } from './subscriptions/useLoadUpdatedSubscription';

export function useLoad(variables: Partial<LoadQueryVariables>) {
  const { authenticated } = useAppSelector((root) => root.global);
  const notify = useNotifications();
  const [getLoad, query] = useLoadLazyQuery();

  React.useEffect(() => {
    if (authenticated && variables?.id && !isEqual(variables, query.variables)) {
      console.debug('[Context::Load] Fetching load', variables);
      getLoad({ variables: variables as LoadQueryVariables });
    }
  }, [authenticated, getLoad, query.variables, variables]);

  const refetch = React.useCallback(() => {
    if (variables?.id) {
      query?.refetch();
    }
  }, [query, variables]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;
  const load = React.useMemo(() => data?.load, [data?.load]);

  const [mutationManifestUser] = useManifestUserMutation();
  const [mutationFinalizeLoad] = useFinalizeLoadMutation();
  const [updateLoadMutation] = useUpdateLoadMutation();
  useLoadUpdated(variables?.id);

  const update = React.useCallback(
    async function UpdateLoad(
      attributes: Partial<UpdateLoadMutationVariables['attributes']>
    ): Promise<TMutationResponse<{ load: LoadDetailsFragment }>> {
      try {
        console.debug('[Context::Load] Updating load', load?.id, attributes);
        if (!load?.id) {
          return { error: 'Load cannot be updated' };
        }

        const { data: response } = await updateLoadMutation({
          variables: {
            id: load?.id as string,
            attributes,
          },
          optimisticResponse: {
            updateLoad: {
              __typename: 'UpdateLoadPayload',
              errors: null,
              fieldErrors: null,
              load: {
                ...load,
                state: (attributes?.state || load?.state) as LoadState,
                dispatchAt: attributes?.dispatchAt || load?.dispatchAt,
              } as LoadDetailsFragment,
            },
          },
        });

        console.debug({ response });

        if (response?.updateLoad?.load?.id) {
          notify.success(`Load #${load?.loadNumber} updated`);
          return { load: response?.updateLoad?.load };
        }

        if (response?.updateLoad?.errors?.[0]) {
          notify.error(response?.updateLoad?.errors?.[0]);
        }
        return {
          error: response?.updateLoad?.errors?.[0],
          fieldErrors: response?.updateLoad?.fieldErrors || undefined,
        };
      } catch (e) {
        console.error(e);
        return { error: 'Something went wrong' };
      }
    },
    [load, notify, updateLoadMutation]
  );

  const manifestUser = React.useCallback(
    async (payload: Omit<CreateSlotPayload, 'loadId'>) => {
      if (load?.id) {
        return undefined;
      }
      const schema = yup.object().shape({
        dropzoneUser: yup.string().required(),
        exitWeight: yup.number().nullable(),
        groupNumber: yup.number().nullable(),
        passengerExitWeight: yup.number().nullable(),
        passengerName: yup.string().nullable(),
        rig: yup.string().nullable(),
        ticketType: yup.string().required('You must select a ticket type'),
        jumpType: yup.string().required('You must specify the type of jump'),
      });
      const validatedPayload = schema.validateSync(payload);
      const response = await mutationManifestUser({
        variables: {
          load: load?.id,
          ...validatedPayload,
        },
      });

      if (response?.data?.createSlot?.fieldErrors?.length) {
        throw new ValidationError(
          response?.data?.createSlot?.fieldErrors?.map(
            ({ field, message }) => new ValidationError([], message, field)
          )
        );
      }
      return response?.data?.createSlot?.slot;
    },
    [load?.id, mutationManifestUser]
  );

  const dispatchInMinutes = React.useCallback(
    async (minutes: number | null) => {
      if (!load) {
        return;
      }
      const dispatchTime = !minutes ? null : DateTime.local().plus({ minutes }).toISO();

      await update({
        dispatchAt: dispatchTime,
        state: dispatchTime ? LoadState.BoardingCall : LoadState.Open,
      });
    },
    [load, update]
  );

  const updateLoadState = React.useCallback(
    async (state: LoadState) => {
      return update({
        state,
        dispatchAt: null,
      });
    },
    [update]
  );

  const updatePilot = React.useCallback(
    async (pilot: { id: string }) => {
      await update({
        pilot: pilot.id,
      });
    },
    [update]
  );

  const updateGCA = React.useCallback(
    async (gca: { id: string }) => {
      await update({
        gca: gca.id,
      });
    },
    [update]
  );

  const updatePlane = React.useCallback(
    async (plane: { id: string; maxSlots: number }) => {
      await update({
        plane: plane.id,
      });
    },
    [update]
  );

  const updateLoadMaster = React.useCallback(
    async (lm: { id: string }) => {
      await update({
        loadMaster: lm.id,
      });
    },
    [update]
  );

  const markAsLanded = React.useCallback(async () => {
    await mutationFinalizeLoad({
      variables: {
        id: Number(load?.id),
        state: LoadState.Landed,
      },
    });
  }, [mutationFinalizeLoad, load]);

  const cancel = React.useCallback(async () => {
    await mutationFinalizeLoad({
      variables: { id: Number(load?.id), state: LoadState.Cancelled },
    });
  }, [mutationFinalizeLoad, load]);

  const canDispatchAircraft = useRestriction(Permission.UpdateLoad);

  const createAircraftDispatchAction = React.useCallback(
    (minutes: number | null) => () => dispatchInMinutes(minutes),
    [dispatchInMinutes]
  );

  const dispatchAtTime = React.useCallback(
    async (time: number | null) => {
      if (!load) {
        return;
      }
      await update({
        dispatchAt: !time ? null : DateTime.fromSeconds(time).toISO(),
        state: time ? LoadState.BoardingCall : LoadState.Open,
      });
    },
    [load, update]
  );

  return React.useMemo(
    () => ({
      loading,
      called,
      update,
      updatePilot,
      updateGCA,
      updatePlane,
      updateLoadMaster,
      manifestUser,
      cancel,
      refetch: queryVariables?.id ? refetch : noop,
      fetchMore: queryVariables?.id ? () => fetchMore({ variables }) : uninitializedHandler,
      load: data?.load,
      dispatchAtTime,
      dispatchInMinutes,
      updateLoadState,
      createAircraftDispatchAction,
      canDispatchAircraft,
      markAsLanded,
    }),
    [
      loading,
      called,
      update,
      updatePilot,
      updateGCA,
      updatePlane,
      updateLoadMaster,
      manifestUser,
      cancel,
      queryVariables?.id,
      refetch,
      data?.load,
      dispatchAtTime,
      dispatchInMinutes,
      updateLoadState,
      createAircraftDispatchAction,
      canDispatchAircraft,
      markAsLanded,
      fetchMore,
      variables,
    ]
  );
}
