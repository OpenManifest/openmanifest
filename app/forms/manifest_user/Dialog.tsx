import * as React from 'react';
import { LoadEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import ManifestForm from './ManifestForm';
import useForm from './useForm';
import { guestValuesOf } from './guests';

export interface IManifestUserDialog {
  open?: boolean;
  load?: Pick<LoadEssentialsFragment, 'id' | 'loadNumber' | 'name'>;
  slot?: Partial<SlotDetailsFragment>;
  onClose(): void;
  onSuccess(): void;
}

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { open, load, slot, onSuccess, onClose } = props;

  const { control, onSubmit, loading } = useForm({
    initial: {
      id: slot?.id,
      load,
      bodyMassKg: slot?.bodyMassKg || Number(slot?.membership?.user?.bodyMassKg || 70),
      membership: slot?.membership,
      extras: slot?.extras || null,
      groupNumber: slot?.groupNumber,
      activityType: slot?.activityType,
      guests: guestValuesOf(slot?.guestSlots),
      equipment: slot?.equipment,
      ticketType: slot?.ticketType || undefined,
    },
    onSuccess,
  });

  return (
    <DialogOrSheet {...{ loading, open, onClose }} buttonAction={onSubmit} buttonLabel="Manifest">
      <ManifestForm {...{ control }} />
    </DialogOrSheet>
  );
}
