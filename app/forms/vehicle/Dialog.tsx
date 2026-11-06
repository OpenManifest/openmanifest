import * as React from 'react';
import { VehicleEssentialsFragment } from 'app/api/operations';
import { ResourceForm } from 'app/ui';
import VehicleForm from './VehicleForm';
import useVehicleForm, { VehicleFields } from './useForm';
import { useTranslation } from 'react-i18next';

export interface IVehicleDialogProps {
  open: boolean;
  initial?: Partial<VehicleFields>;
  original?: VehicleEssentialsFragment;
  onClose(): void;
  /** Archives the item being edited (a setup list passes it; elsewhere the form only saves) */
  onArchive?(): void;
}

export default function VehicleDialog(props: IVehicleDialogProps) {
  const { t } = useTranslation('common');
  const { open, onClose, initial, original } = props;
  const { control, loading, onSubmit, reset } = useVehicleForm({
    initial: {
      id: original?.id || initial?.id || undefined,
      name: original?.name || initial?.name,
      registration: original?.registration || original?.registration || undefined,
      minCapacity: original?.minCapacity || original?.minCapacity || undefined,
      capacity: original?.capacity || original?.capacity,
      maxPayloadKg: original?.maxPayloadKg ?? initial?.maxPayloadKg ?? 0,
    },
    onSuccess: onClose,
  });

  // What was typed and not saved goes when the form closes
  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <ResourceForm
      onArchive={props.onArchive}
      {...{ open, loading, onClose }}
      title={original?.id ? t('forms.vehicle.editAircraft') : t('forms.vehicle.newAircraft')}
      open={open}
      onSubmit={onSubmit}
    >
      <VehicleForm {...{ control }} />
    </ResourceForm>
  );
}
