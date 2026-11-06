import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind } from 'app/api/schema.d';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
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
}

export default function DestinationDialog({
  open,
  original,
  kinds,
  onClose,
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
    <DialogOrSheet
      {...{ open, loading, onClose }}
      title={
        original?.id
          ? t('forms.destination.editDestination', { destination })
          : t('forms.destination.newDestination', { destination })
      }
      buttonAction={onSubmit}
      buttonLabel={t('forms.save')}
    >
      <DestinationForm {...{ control, kinds }} />
    </DialogOrSheet>
  );
}
