import * as React from 'react';
import { noop } from 'lodash';
import { useManifest } from 'app/api/crud/useManifest';
import { uninitializedHandler } from 'app/api/crud/factory';
import type { IManifestUserDialog } from 'app/forms/manifest_user/Dialog';
import type { ICreditsSheet } from 'app/forms/credits/Credits';
import type { ILoadDialog } from 'app/forms/load/Dialog';
import type { IDialogContextSubstate } from '../hooks/useDialog';

interface IManifestContext {
  manifest: ReturnType<typeof useManifest>;
  dialogs: {
    manifestUser: IDialogContextSubstate<
      Omit<IManifestUserDialog, 'open' | 'onClose' | 'onSuccess'>
    >;
    credits: IDialogContextSubstate<Omit<ICreditsSheet, 'open' | 'onClose' | 'onSuccess'>>;
    load: IDialogContextSubstate<Omit<ILoadDialog, 'open' | 'onClose' | 'onSuccess'>>;
  };
}
export const INITIAL_CONTEXT: IManifestContext = {
  manifest: {
    called: false,
    loading: false,
    loads: [],
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
    deleteSlot: uninitializedHandler as never,
    manifestUser: uninitializedHandler as never,
    manifestGroup: uninitializedHandler as never,
    moveSlot: uninitializedHandler as never,
    createLoad: uninitializedHandler as never,
    permissions: {
      canAddTransaction: false,
      canCreateLoad: false,
      canDeleteOwnSlot: false,
      canDeleteSlot: false,
      canManifestOthers: false,
      canManifestSelf: false,
      canUpdateOwnSlot: false,
      canUpdateSlot: false,
    },
  },
  dialogs: {
    manifestUser: {
      open: noop,
      close: noop,
      visible: false,
      state: {
        slot: undefined,
        load: undefined,
      },
    },
    load: {
      open: noop,
      close: noop,
      visible: false,
      state: {
        load: undefined,
      },
    },
    credits: {
      open: noop,
      close: noop,
      visible: false,
      state: {
        dropzoneUser: undefined,
      },
    },
  },
};
export const ManifestContext = React.createContext<IManifestContext>(INITIAL_CONTEXT);

export function useManifestContext() {
  return React.useContext(ManifestContext);
}
