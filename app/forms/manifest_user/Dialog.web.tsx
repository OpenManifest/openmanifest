import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import * as React from 'react';
import { usePortal } from '@gorhom/portal';
import { LoadEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import SlotForm from './ManifestForm';
import useForm from './useForm';

interface IManifestUserDialog {
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
      exitWeight: slot?.exitWeight || Number(slot?.dropzoneUser?.user?.exitWeight || 70),
      dropzoneUser: slot?.dropzoneUser,
      extras: slot?.extras || null,
      groupNumber: slot?.groupNumber,
      jumpType: slot?.jumpType,
      passengerExitWeight: slot?.passengerExitWeight,
      passengerName: slot?.passengerName,
      rig: slot?.rig,
      ticketType: slot?.ticketType || undefined
    },
    onSuccess
  });

  const portal = usePortal('drawer');

  React.useEffect(() => {
    if (!open) {
      portal.removePortal('drawer');
    }
  }, [open, portal]);

  return (
    <DialogOrSheet
      title={`Manifest ${slot?.dropzoneUser?.user?.name} on ${load?.name || `Load #${load?.loadNumber || 1}`}`}
      {...{ open, onClose, loading }}
      buttonLabel="Manifest"
      buttonAction={onSubmit}
    >
      <SlotForm {...{ control }} />
    </DialogOrSheet>
  );
}
