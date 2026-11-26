import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind } from 'app/api/schema.d';
import { ResourceForm } from 'app/ui';
import useTerms from 'app/i18n/useTerms';
import { activeUnits } from 'app/i18n/operatorFormat';
import { fromSi, unitOf } from 'app/i18n/units';
import DestinationForm from './DestinationForm';
import useForm from './useForm';

export interface IDestinationDialogProps {
  open: boolean;
  /** The destination being edited; none for a new one */
  original?: DestinationEssentialsFragment | null;
  /** The kinds the operator may create */
  kinds: DestinationKind[];
  onClose(): void;
  /** Archives the item being edited (a setup list passes it; elsewhere the form only saves) */
  onArchive?(): void;
}

export default function DestinationDialog({
  open,
  original,
  kinds,
  onClose,
  onArchive,
}: IDestinationDialogProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const initial = React.useMemo(
    () => ({
      id: original?.id,
      name: original?.name,
      kind: original?.kind ?? kinds[0],
      altitude:
        original?.altitudeM == null
          ? undefined
          : Math.round(fromSi('altitude', original.altitudeM, unitOf('altitude', activeUnits()))),
    }),
    [original, kinds]
  );
  const { control, loading, onSubmit, reset } = useForm({ initial, onSuccess: onClose });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const destination = term('destination').toLowerCase();
  return (
    <ResourceForm
      onArchive={onArchive}
      {...{ open, loading, onClose }}
      title={
        original?.id
          ? t('forms.destination.editDestination', { destination })
          : t('forms.destination.newDestination', { destination })
      }
      onSubmit={onSubmit}
    >
      <DestinationForm {...{ control, kinds }} />
    </ResourceForm>
  );
}
