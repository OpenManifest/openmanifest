import * as React from 'react';
import { PlaneEssentialsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import PlaneForm from './AircraftForm';
import useAircraftForm, { AircraftFields } from './useForm';

export interface IPlaneDialogProps {
  open: boolean;
  initial?: Partial<AircraftFields>;
  original?: PlaneEssentialsFragment;
  onClose(): void;
}

export default function AircraftDialog(props: IPlaneDialogProps) {
  const { open, onClose, initial, original } = props;
  const { control, loading, onSubmit } = useAircraftForm({
    initial: {
      id: original?.id || initial?.id || undefined,
      name: original?.name || initial?.name,
      registration: original?.registration || original?.registration || undefined,
      minSlots: original?.minSlots || original?.minSlots || undefined,
      maxSlots: original?.maxSlots || original?.maxSlots,
    },
    onSuccess: onClose,
  });

  const snapPoints = React.useMemo(() => [580, '80%'], []);

  return (
    <DialogOrSheet
      {...{ open, loading, onClose }}
      title={original?.id ? 'Edit aircraft' : 'New aircraft'}
      open={open}
      snapPoints={snapPoints}
      buttonLabel="Save"
      buttonAction={onSubmit}
    >
      <PlaneForm {...{ control }} />
    </DialogOrSheet>
  );
}
