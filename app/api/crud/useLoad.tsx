import * as React from 'react';
import { noop } from 'lodash';
import { DateTime } from 'luxon';
import { Button, Dialog } from 'react-native-paper';
import TimePicker from 'app/components/input/time_picker/TimePicker';
import { actions, useAppDispatch } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { useFinalizeLoadMutation, useLoadQuery } from '../reflection';
import { LoadQueryVariables } from '../operations';
import createCRUDContext, { uninitializedHandler } from './factory';
import { LoadState, Permission } from '../schema.d';
import useMutationUpdateLoad from '../hooks/useMutationUpdateLoad';

export default function useLoad(variables: Partial<LoadQueryVariables>) {
  const dispatch = useAppDispatch();
  const query = useLoadQuery({
    initialFetchPolicy: 'cache-first',
    variables: variables as LoadQueryVariables,
    skip: !variables?.id,
  });
  console.debug({
    error: query?.error,
    loading: query?.loading,
    data: query?.data,
    called: query?.called,
    variables,
  });

  const refetch = React.useCallback(() => {
    if (variables?.id) {
      query?.refetch();
    }
  }, [query, variables]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;
  const load = React.useMemo(() => data?.load, [data?.load]);

  const [isTimePickerVisible, setTimePickerVisible] = React.useState(false);
  const closeTimePicker = React.useCallback(() => setTimePickerVisible(false), []);
  const openTimePicker = React.useCallback(() => setTimePickerVisible(true), []);

  const [mutationFinalizeLoad] = useFinalizeLoadMutation();

  const update = useMutationUpdateLoad({
    onSuccess: () =>
      dispatch(
        actions.notifications.showSnackbar({
          message: `Load #${load?.loadNumber} updated`,
          variant: 'success',
        })
      ),
    onError: (message) =>
      dispatch(
        actions.notifications.showSnackbar({
          message,
          variant: 'error',
        })
      ),
  });

  const dispatchInMinutes = React.useCallback(
    async (minutes: number | null) => {
      if (!load) {
        return;
      }
      const dispatchTime = !minutes ? null : DateTime.now().plus({ minutes }).toISO();

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
    async (plane: { id: string | number }) => {
      await update.mutate({
        id: Number(load?.id),
        plane: Number(plane.id),
      });
    },
    [update, load?.id]
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
      cancel,
      refetch: queryVariables?.id ? refetch : noop,
      fetchMore: queryVariables?.id ? () => fetchMore({ variables }) : uninitializedHandler,
      load: data?.load,
      timepicker: {
        visible: isTimePickerVisible,
        close: closeTimePicker,
        open: openTimePicker,
      },
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
      isTimePickerVisible,
      closeTimePicker,
      openTimePicker,
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

const { Provider, useContext: useLoadContext } = createCRUDContext(useLoad, {
  called: false,
  loading: false,
  load: null,
  update: { loading: false, mutate: uninitializedHandler as never },
  updateGCA: uninitializedHandler as never,
  updateLoadMaster: uninitializedHandler as never,
  updatePlane: uninitializedHandler as never,
  updatePilot: uninitializedHandler as never,
  refetch: uninitializedHandler as never,
  fetchMore: uninitializedHandler as never,
  canDispatchAircraft: false,
  createAircraftDispatchAction: noop as never,
  dispatchAtTime: uninitializedHandler as never,
  dispatchInMinutes: uninitializedHandler as never,
  markAsLanded: uninitializedHandler as never,
  cancel: uninitializedHandler as never,
  timepicker: {
    visible: false,
    close: noop,
    open: noop,
  },
  updateLoadState: uninitializedHandler as never,
});

function CustomCallTimePicker() {
  const { timepicker, dispatchAtTime } = useLoadContext();
  const [time, setTime] = React.useState<number>();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = React.useCallback(() => {
    try {
      setLoading(true);
      if (time) {
        dispatchAtTime(time).then(timepicker.close);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatchAtTime, time, timepicker.close]);
  return (
    <Dialog visible={timepicker.visible} dismissable onDismiss={timepicker.close}>
      <Dialog.Title>Dispatch Aircraft</Dialog.Title>
      <Dialog.Content>
        <TimePicker onChange={setTime} timestamp={time} label="Take-off" />
      </Dialog.Content>
      <Dialog.Actions>
        <Button disabled={loading} onPress={timepicker.close}>
          Cancel
        </Button>
        <Button disabled={loading} onPress={onSubmit}>
          Dispatch
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

export function LoadProvider(props: React.PropsWithChildren<Partial<LoadQueryVariables>>) {
  const { children } = props;
  return (
    <Provider {...props}>
      {children}
      <CustomCallTimePicker />
    </Provider>
  );
}

export function withLoad<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedWithLoad(props: T & Partial<LoadQueryVariables>) {
    const { id, ...rest } = props;
    return (
      <LoadProvider {...{ id }}>
        <Component {...(rest as T)} />
      </LoadProvider>
    );
  };
}

export { useLoadContext, useLoad };
