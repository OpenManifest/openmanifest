import * as React from 'react';
import noop from 'lodash/noop';
import { uninitializedHandler } from 'app/api/crud/factory';
import { useOperator } from 'app/api/crud/useOperator';
import type { IPlaneDialogProps } from 'app/forms/aircraft/Dialog';
import type { ITicketTypeDialog } from 'app/forms/ticket_type/Dialog';
import type { ITicketTypeAddonDialog } from 'app/forms/ticket_type_addon/Dialog';
import type { ICreateGhostDialog } from 'app/forms/create_user/Dialog';
import type { IDialogContextSubstate } from '../hooks/useDialog';

interface IOperatorContext {
  operator: ReturnType<typeof useOperator>;
  dialogs: {
    aircraft: IDialogContextSubstate<Pick<IPlaneDialogProps, 'initial' | 'original'>>;
    ticketType: IDialogContextSubstate<Pick<ITicketTypeDialog, 'initial' | 'original'>>;
    ticketTypeAddon: IDialogContextSubstate<Pick<ITicketTypeAddonDialog, 'initial' | 'original'>>;
    createUser: IDialogContextSubstate<Pick<ICreateGhostDialog, 'initial' | 'original'>>;
  };
}

export const INITIAL_CONTEXT: IOperatorContext = {
  operator: {
    permissions: [],
    update: uninitializedHandler as never,
    called: false,
    loading: false,
    operator: null,
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
    createUser: {
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

export const OperatorContext = React.createContext<IOperatorContext>(INITIAL_CONTEXT);

export function useOperatorContext() {
  return React.useContext(OperatorContext);
}
