import * as React from 'react';
import type { EquipmentEssentialsFragment } from 'app/api/operations';
import { ResourceForm } from 'app/ui';
import { useOperatorContext } from 'app/providers/operator/context';
import EquipmentForm from './EquipmentForm';
import useEquipmentForm from './useForm';
import { useTranslation } from 'react-i18next';
import useTerms from 'app/i18n/useTerms';

export interface IEquipmentDialogProps {
  open?: boolean;
  /** The equipment being edited; a new item when absent */
  equipment?: EquipmentEssentialsFragment | null;
  operatorId?: number;
  userId?: number;
  onClose(): void;
  /** Archives the item being edited (a setup list passes it; elsewhere the form only saves) */
  onArchive?(): void;
  onSuccess?(): void;
}

const NO_KINDS: never[] = [];

export default function EquipmentDialog(props: IEquipmentDialogProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const { open, equipment, operatorId, userId, onClose, onSuccess } = props;
  const {
    operator: { operator },
  } = useOperatorContext();
  const kinds = operator?.equipmentKinds ?? NO_KINDS;
  const { control, kind, loading, onSubmit, operatorOwned } = useEquipmentForm({
    equipment,
    kinds,
    operatorId,
    userId,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });
  const equipmentTerm = { equipment: term('equipment').toLowerCase() };

  return (
    <ResourceForm
      onArchive={props.onArchive}
      title={
        equipment?.id
          ? t('forms.equipment.editEquipment', equipmentTerm)
          : t('forms.equipment.newEquipment', equipmentTerm)
      }
      open={!!open}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
    >
      <EquipmentForm {...{ control, kinds, kind, operatorOwned }} canChooseKind={!equipment?.id} />
    </ResourceForm>
  );
}
