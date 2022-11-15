import * as React from 'react';
import noop from 'lodash/noop';
import { uninitializedHandler } from 'app/api/crud/factory';
import { useLoad } from 'app/api/crud/useLoad';
import type { IDialogContextSubstate } from '../hooks/useDialog';

interface ILoadContext {
  load: ReturnType<typeof useLoad>;
  dialogs: {
    timepicker: IDialogContextSubstate<object>;
  };
}

export const INITIAL_CONTEXT: ILoadContext = {
  load: {
    called: false,
    loading: false,
    load: null,
    update: { loading: false, mutate: uninitializedHandler as never },
    updateGCA: uninitializedHandler as never,
    updateLoadMaster: uninitializedHandler as never,
    updatePlane: uninitializedHandler as never,
    updatePilot: uninitializedHandler as never,
    manifestUser: uninitializedHandler as never,
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
    canDispatchAircraft: false,
    createAircraftDispatchAction: noop as never,
    dispatchAtTime: uninitializedHandler as never,
    dispatchInMinutes: uninitializedHandler as never,
    markAsLanded: uninitializedHandler as never,
    cancel: uninitializedHandler as never,
    updateLoadState: uninitializedHandler as never,
  },
  dialogs: {
    timepicker: {
      visible: false,
      close: noop,
      open: noop,
    },
  },
};

export const LoadContext = React.createContext<ILoadContext>(INITIAL_CONTEXT);

export function useLoadContext() {
  return React.useContext(LoadContext);
}
