import * as React from 'react';
import { LoadEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import ManifestForm from './ManifestForm';
import useForm from './useForm';

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
      exitWeight: slot?.exitWeight || Number(slot?.dropzoneUser?.user?.exitWeight || 70),
      dropzoneUser: slot?.dropzoneUser,
      extras: slot?.extras || null,
      groupNumber: slot?.groupNumber,
      jumpType: slot?.jumpType,
      passengerExitWeight: slot?.passengerExitWeight,
      passengerName: slot?.passengerName,
      rig: slot?.rig,
      ticketType: slot?.ticketType || undefined,
    },
    onSuccess,
  });

  const snapPoints = React.useMemo(() => [600], []);

  return (
    <DialogOrSheet
      {...{ loading, open, onClose }}
      snapPoints={snapPoints}
      buttonAction={onSubmit}
      buttonLabel="Manifest"
    >
      <ManifestForm {...{ control }} />
    </DialogOrSheet>
  );
}
