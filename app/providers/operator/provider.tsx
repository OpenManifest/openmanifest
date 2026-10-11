import * as React from 'react';
import type { OperatorQueryVariables } from 'app/api/operations';
import { useOperator } from 'app/api/crud/useOperator';
import AircraftSheet from 'app/forms/aircraft/Dialog';
import CreateUserSheet from 'app/forms/create_user/Dialog';
import TicketTypeSheet from 'app/forms/ticket_type/Dialog';
import TicketTypeAddonSheet from 'app/forms/ticket_type_addon/Dialog';
import type { IPlaneDialogProps } from 'app/forms/aircraft/Dialog';
import type { ITicketTypeDialog } from 'app/forms/ticket_type/Dialog';
import type { ITicketTypeAddonDialog } from 'app/forms/ticket_type_addon/Dialog';
import type { ICreateGhostDialog } from 'app/forms/create_user/Dialog';
import { OperatorContext } from './context';
import createUseDialog from '../hooks/useDialog';

const useAircraftDialog = createUseDialog<Pick<IPlaneDialogProps, 'initial' | 'original'>>();
const useCreateUserDialog = createUseDialog<Pick<ICreateGhostDialog, 'initial' | 'original'>>();
const useTicketTypeDialog = createUseDialog<Pick<ITicketTypeDialog, 'initial' | 'original'>>();
const useTicketTypeAddonDialog =
  createUseDialog<Pick<ITicketTypeAddonDialog, 'initial' | 'original'>>();

function OperatorContextProvider(props: React.PropsWithChildren<Partial<OperatorQueryVariables>>) {
  const { children, ...variables } = props;
  const operator = useOperator(variables);
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
      operator,
      dialogs,
    }),
    [operator, dialogs]
  );
  return (
    <OperatorContext.Provider value={context}>
      {children}
      <AircraftSheet {...aircraft.state} onClose={aircraft.close} open={aircraft.visible} />
      <TicketTypeSheet {...ticketType.state} onClose={ticketType.close} open={ticketType.visible} />
      <CreateUserSheet {...createUser.state} onClose={createUser.close} open={createUser.visible} />
      <TicketTypeAddonSheet
        {...ticketTypeAddon.state}
        onClose={ticketTypeAddon.close}
        open={ticketTypeAddon.visible}
      />
    </OperatorContext.Provider>
  );
}

export function withOperatorContext<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedWithLoad(props: T & Partial<OperatorQueryVariables>) {
    const { operatorId, ...rest } = props;
    return (
      <OperatorContextProvider {...{ operatorId }}>
        <Component {...(rest as T)} />
      </OperatorContextProvider>
    );
  };
}

export { OperatorContextProvider };
