import * as React from 'react';
import type { DropzoneQueryVariables } from 'app/api/operations';
import { useDropzone } from 'app/api/crud/useDropzone';
import AircraftSheet from 'app/forms/aircraft/Dialog';
import CreateUserSheet from 'app/forms/create_user/Dialog';
import TicketTypeSheet from 'app/forms/ticket_type/Dialog';
import TicketTypeAddonSheet from 'app/forms/ticket_type_addon/Dialog';
import type { IPlaneDialogProps } from 'app/forms/aircraft/Dialog';
import type { ITicketTypeDialog } from 'app/forms/ticket_type/Dialog';
import type { ITicketTypeAddonDialog } from 'app/forms/ticket_type_addon/Dialog';
import type { ICreateGhostDialog } from 'app/forms/create_user/Dialog';
import { DropzoneContext } from './context';
import createUseDialog from '../hooks/useDialog';

const useAircraftDialog = createUseDialog<Pick<IPlaneDialogProps, 'initial' | 'original'>>();
const useCreateUserDialog = createUseDialog<Pick<ICreateGhostDialog, 'initial' | 'original'>>();
const useTicketTypeDialog = createUseDialog<Pick<ITicketTypeDialog, 'initial' | 'original'>>();
const useTicketTypeAddonDialog =
  createUseDialog<Pick<ITicketTypeAddonDialog, 'initial' | 'original'>>();

function DropzoneContextProvider(props: React.PropsWithChildren<Partial<DropzoneQueryVariables>>) {
  const { children, ...variables } = props;
  const dropzone = useDropzone(variables);
  const aircraft = useAircraftDialog();
  const ticketType = useTicketTypeDialog();
  const ticketTypeAddon = useTicketTypeAddonDialog();
  const createUser = useCreateUserDialog();
  const dialogs = React.useMemo(
    () => ({ aircraft, ticketType, ticketTypeAddon, createUser }),
    [aircraft, ticketType, ticketTypeAddon, createUser]
  );

  const context = React.useMemo(
    () => ({
      dropzone,
      dialogs,
    }),
    [dropzone, dialogs]
  );
  return (
    <DropzoneContext.Provider value={context}>
      {children}
      <AircraftSheet {...aircraft.state} onClose={aircraft.close} open={aircraft.visible} />
      <TicketTypeSheet {...ticketType.state} onClose={ticketType.close} open={ticketType.visible} />
      <CreateUserSheet {...createUser.state} onClose={createUser.close} open={createUser.visible} />
      <TicketTypeAddonSheet
        {...ticketTypeAddon.state}
        onClose={ticketTypeAddon.close}
        open={ticketTypeAddon.visible}
      />
    </DropzoneContext.Provider>
  );
}

export function withDropzoneContext<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedWithLoad(props: T & Partial<DropzoneQueryVariables>) {
    const { dropzoneId, ...rest } = props;
    return (
      <DropzoneContextProvider {...{ dropzoneId }}>
        <Component {...(rest as T)} />
      </DropzoneContextProvider>
    );
  };
}

export { DropzoneContextProvider };
