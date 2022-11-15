import * as React from 'react';
import noop from 'lodash/noop';
import { uninitializedHandler } from 'app/api/crud/factory';
import { useDropzone } from 'app/api/crud/useDropzone';
import type { IPlaneDialogProps } from 'app/forms/aircraft/Dialog';
import type { ITicketTypeDialog } from 'app/forms/ticket_type/Dialog';
import type { ITicketTypeAddonDialog } from 'app/forms/ticket_type_addon/Dialog';
import type { IDialogContextSubstate } from '../hooks/useDialog';

interface IDropzoneContext {
  dropzone: ReturnType<typeof useDropzone>;
  dialogs: {
    aircraft: IDialogContextSubstate<Pick<IPlaneDialogProps, 'initial' | 'original'>>;
    ticketType: IDialogContextSubstate<Pick<ITicketTypeDialog, 'initial' | 'original'>>;
    ticketTypeAddon: IDialogContextSubstate<Pick<ITicketTypeAddonDialog, 'initial' | 'original'>>;
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
    aircraft: {
      visible: false,
      close: noop,
      open: noop,
    },
    ticketType: {
      visible: false,
      close: noop,
      open: noop,
    },
    ticketTypeAddon: {
      visible: false,
      close: noop,
      open: noop,
    },
  },
};

export const DropzoneContext = React.createContext<IDropzoneContext>(INITIAL_CONTEXT);

export function useDropzoneContext() {
  return React.useContext(DropzoneContext);
}
