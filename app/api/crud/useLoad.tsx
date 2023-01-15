import * as React from 'react';
import { isEqual, noop } from 'lodash';
import { DateTime } from 'luxon';
import useRestriction from 'app/hooks/useRestriction';
import * as yup from 'yup';
import { ValidationError } from 'yup';
import { useNotifications } from 'app/providers/notifications';
import { useAppSelector } from 'app/state';
import {
  LoadUpdatedDocument,
  useFinalizeLoadMutation,
  useLoadLazyQuery,
  useManifestUserMutation,
} from '../reflection';
import { LoadQueryVariables } from '../operations';
import { uninitializedHandler } from './factory';
import { CreateSlotPayload, LoadState, Permission } from '../schema.d';
import useMutationUpdateLoad from '../hooks/useMutationUpdateLoad';

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

  const { loading, fetchMore, data, called, variables: queryVariables, subscribeToMore } = query;
  const load = React.useMemo(() => data?.load, [data?.load]);

  const [mutationManifestUser] = useManifestUserMutation();
  const [mutationFinalizeLoad] = useFinalizeLoadMutation();

  // Subscribe to updates over websockets
  React.useEffect(() => {
    if (!authenticated || !data?.load?.id) {
      return undefined;
    }
    console.debug('[Apollo::Subscriptions::Load] Subscribed to updates for load', data?.load?.id);
    const unsubscribe = subscribeToMore({
      document: LoadUpdatedDocument,
      variables: { id: data?.load?.id },
      onError: console.error,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData?.data?.load?.id) {
          return prev;
        }
        console.debug('[Apollo::Subscriptions::Load] Received update', subscriptionData.data.load);
        return {
          ...prev,
          load: {
            ...(prev?.load || {}),
            ...subscriptionData.data.load,
          },
        };
      },
    });

    return () => {
      console.debug('[Apollo::Subscriptions::Load] Unsubscribing');
      unsubscribe();
    };
  }, [data?.load?.id, subscribeToMore, authenticated]);

  const update = useMutationUpdateLoad({
    onSuccess: () => notify.success(`Load #${load?.loadNumber} updated`),
    onError: (message) => notify.error(message),
  });

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

      await update.mutate({
        id: Number(load?.id),
        dispatchAt: dispatchTime,
        state: dispatchTime ? LoadState.BoardingCall : LoadState.Open,
      });
    },
    [load, update]
  );

  const updateLoadState = React.useCallback(
    async (state: LoadState) => {
      if (!load) {
        return;
      }
      await update.mutate({
        id: Number(load?.id),
        state,
        dispatchAt: null,
      });
    },
    [update, load]
  );

  const updatePilot = React.useCallback(
    async (pilot: { id: string | number }) => {
      await update.mutate({
        id: Number(load?.id),
        pilot: Number(pilot.id),
      });
    },
    [update, load?.id]
  );

  const updateGCA = React.useCallback(
    async (gca: { id: number | string }) => {
      await update.mutate({
        id: Number(load?.id),
        gca: Number(gca.id),
      });
    },
    [update, load?.id]
  );

  const updatePlane = React.useCallback(
    async (plane: { id: string | number; maxSlots: number }) => {
      await update.mutate({
        id: Number(load?.id),
        plane: Number(plane.id),
      });
    },
    [load?.id, update]
  );

  const updateLoadMaster = React.useCallback(
    async (lm: { id: number | string }) => {
      await update.mutate({
        id: Number(load?.id),
        loadMaster: Number(lm.id),
      });
    },
    [update, load?.id]
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
      if (!load || !time) {
        return;
      }
      await update.mutate({
        id: Number(load?.id),
        dispatchAt: DateTime.fromSeconds(time).toISO(),
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
