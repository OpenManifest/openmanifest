import * as React from 'react';
import { VehicleEssentialsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import VehicleForm from './VehicleForm';
import useVehicleForm, { VehicleFields } from './useForm';

export interface IVehicleDialogProps {
  open: boolean;
  initial?: Partial<VehicleFields>;
  original?: VehicleEssentialsFragment;
  onClose(): void;
}

export default function VehicleDialog(props: IVehicleDialogProps) {
  const { open, onClose, initial, original } = props;
  const { control, loading, onSubmit } = useVehicleForm({
    initial: {
      id: original?.id || initial?.id || undefined,
      name: original?.name || initial?.name,
      registration: original?.registration || original?.registration || undefined,
      minCapacity: original?.minCapacity || original?.minCapacity || undefined,
      capacity: original?.capacity || original?.capacity,
    },
    onSuccess: onClose,
  });

  return (
    <DialogOrSheet
      {...{ open, loading, onClose }}
      title={original?.id ? 'Edit aircraft' : 'New aircraft'}
      open={open}
      buttonLabel="Save"
      buttonAction={onSubmit}
    >
      <VehicleForm {...{ control }} />
    </DialogOrSheet>
  );
}
