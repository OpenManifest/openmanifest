import * as React from 'react';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import { TicketTypeAddonDetailsFragment } from 'app/api/operations';
import TicketTypeForm from './TicketAddonForm';
import useForm from './useForm';
import type { TicketTypeAddonFields } from './useForm';

export interface ITicketTypeAddonDialog {
  open: boolean;
  original?: TicketTypeAddonDetailsFragment;
  initial?: Partial<TicketTypeAddonFields>;
  onClose(): void;
}

export default function TicketTypeDialog(props: ITicketTypeAddonDialog) {
  const { open, initial, original, onClose } = props;
  const { control, loading, onSubmit } = useForm({
    initial: {
      name: original?.name || initial?.name,
      cost: original?.cost || initial?.cost,
      ticketTypes: original?.ticketTypes || initial?.ticketTypes || [],
      id: original?.id || initial?.id || undefined,
    },
    onSuccess: onClose,
  });

  const snapPoints = React.useMemo(() => [550, 650], []);
  return (
    <DialogOrSheet
      {...{ open, loading, onClose }}
      title={original?.id ? 'Edit ticket' : 'New ticket'}
      snapPoints={snapPoints}
      buttonAction={onSubmit}
      buttonLabel="Save"
    >
      <TicketTypeForm {...{ control }} />
    </DialogOrSheet>
  );
}
