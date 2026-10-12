import * as React from 'react';
import { VehicleEssentialsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import VehicleForm from './VehicleForm';
import useVehicleForm, { VehicleFields } from './useForm';
import { useTranslation } from 'react-i18next';

export interface IVehicleDialogProps {
  open: boolean;
  initial?: Partial<VehicleFields>;
  original?: VehicleEssentialsFragment;
  onClose(): void;
}

export default function VehicleDialog(props: IVehicleDialogProps) {
  const { t } = useTranslation('common');
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
      title={original?.id ? t('forms.vehicle.editAircraft') : t('forms.vehicle.newAircraft')}
      open={open}
      buttonLabel={t('forms.save')}
      buttonAction={onSubmit}
    >
      <VehicleForm {...{ control }} />
    </DialogOrSheet>
  );
}
