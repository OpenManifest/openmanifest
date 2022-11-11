import { noop } from 'lodash';
import createCRUDContext, { uninitializedHandler } from '../factory';
import { useManifest } from './useManifest';

const {
  Provider: ManifestProvider,
  useContext: useManifestContext,
  INITIAL_STATE,
} = createCRUDContext(useManifest, {
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
    canCreateLoad: false,
    canDeleteOwnSlot: false,
    canDeleteSlot: false,
    canManifestOthers: false,
    canManifestSelf: false,
    canUpdateOwnSlot: false,
    canUpdateSlot: false,
  },
  dialogs: {
    user: {
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
});

export { ManifestProvider, useManifestContext, INITIAL_STATE };
