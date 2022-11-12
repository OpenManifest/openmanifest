import * as React from 'react';
import noop from 'lodash/noop';
import { uninitializedHandler } from 'app/api/crud/factory';
import { useDropzone } from 'app/api/crud';
import { IDialogContextSubstate } from '../hooks/useDialog';

interface IDropzoneContext {
  dropzone: ReturnType<typeof useDropzone>;
  dialogs: {
    // timepicker: IDialogContextSubstate<object>;
  };
}

export const INITIAL_CONTEXT: IDropzoneContext = {
  dropzone: {
    permissions: [],
    called: false,
    loading: false,
    dropzone: null,
    currentUser: undefined,
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
  },
  dialogs: {
  },
};

export const DropzoneContext = React.createContext<IDropzoneContext>(INITIAL_CONTEXT);

export function useDropzoneContext() {
  return React.useContext(DropzoneContext);
}
