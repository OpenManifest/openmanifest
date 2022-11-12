import * as React from 'react';
import type { DropzoneQueryVariables } from 'app/api/operations';
import { useDropzone } from 'app/api/crud';
import AircraftSheet from 'app/forms/aircraft';
import TicketTypeSheet from 'app/forms/ticket_type';
import TicketTypeAddonSheet from 'app/forms/ticket_type_addon';
import type { IPlaneDialogProps } from 'app/forms/aircraft/Dialog';
import type { ITicketTypeDialog } from 'app/forms/ticket_type/Dialog';
import type { ITicketTypeAddonDialog } from 'app/forms/ticket_type_addon/Dialog';
import { DropzoneContext } from './context';
import createUseDialog from '../hooks/useDialog';

const useAircraftDialog = createUseDialog<Pick<IPlaneDialogProps, 'initial' | 'original'>>();
const useTicketTypeDialog = createUseDialog<Pick<ITicketTypeDialog, 'initial' | 'original'>>();
const useTicketTypeAddonDialog =
  createUseDialog<Pick<ITicketTypeAddonDialog, 'initial' | 'original'>>();

function DropzoneContextProvider(props: React.PropsWithChildren<Partial<DropzoneQueryVariables>>) {
  const { children, ...variables } = props;
  const dropzone = useDropzone(variables);
  const aircraft = useAircraftDialog();
  const ticketType = useTicketTypeDialog();
  const ticketTypeAddon = useTicketTypeAddonDialog();
  const dialogs = React.useMemo(
    () => ({ aircraft, ticketType, ticketTypeAddon }),
    [aircraft, ticketType, ticketTypeAddon]
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
