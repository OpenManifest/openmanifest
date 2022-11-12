import * as React from 'react';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import { TicketTypeDetailsFragment } from 'app/api/operations';
import TicketTypeForm from './TicketTypeForm';
import useForm, { TicketTypeFields } from './useForm';

export interface ITicketTypeDialog {
  open: boolean;
  original?: TicketTypeDetailsFragment;
  initial?: Partial<TicketTypeFields>;
  onClose(): void;
}

export default function TicketTypeDialog(props: ITicketTypeDialog) {
  const { open, initial, original, onClose } = props;
  const { control, loading, onSubmit } = useForm({
    initial: {
      name: original?.name || initial?.name,
      cost: original?.cost || initial?.cost,
      allowManifestingSelf: original?.allowManifestingSelf || initial?.allowManifestingSelf,
      altitude: original?.altitude || initial?.altitude,
      extras: original?.extras || initial?.extras,
      id: original?.id || initial?.id || undefined,
      isTandem: original?.isTandem || initial?.isTandem,
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
