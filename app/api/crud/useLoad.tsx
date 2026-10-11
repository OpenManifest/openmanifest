import * as React from 'react';
import { noop } from 'lodash';
import sameVariables from 'app/utils/sameVariables';
import { DateTime } from 'luxon';
import useRestriction from 'app/hooks/useRestriction';
import { useNotifications } from 'app/providers/notifications';
import { useAuthenticated } from 'app/state';
import { useFinalizeLoadMutation, useLoadLazyQuery, useUpdateLoadMutation } from '../reflection';
import {
  LoadDetailsFragment,
  LoadQueryVariables,
  UpdateLoadMutationVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';
import { LoadState, Permission } from '../schema.d';
import { useLoadUpdated } from './subscriptions/useLoadUpdatedSubscription';

export function useLoad(variables: Partial<LoadQueryVariables>) {
  const authenticated = useAuthenticated();
  const notify = useNotifications();
  const [getLoad, query] = useLoadLazyQuery();

  React.useEffect(() => {
    if (authenticated && variables?.id && !sameVariables(variables, query.variables)) {
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
