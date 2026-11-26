import * as React from 'react';
import { ResourceForm } from 'app/ui';
import { TicketTypeDetailsFragment } from 'app/api/operations';
import TicketTypeForm from './TicketTypeForm';
import useForm, { TicketTypeFields } from './useForm';
import { fromCents } from 'app/utils/money';
import { useTranslation } from 'react-i18next';

export interface ITicketTypeDialog {
  open: boolean;
  original?: TicketTypeDetailsFragment;
  initial?: Partial<TicketTypeFields>;
  onClose(): void;
  /** Archives the item being edited (a setup list passes it; elsewhere the form only saves) */
  onArchive?(): void;
}

/** A limit of the ticket as the form types it */
function limitText(limits: unknown, key: string) {
  const value = (limits as Record<string, unknown> | null | undefined)?.[key];
  return typeof value === 'number' ? String(value) : undefined;
}

export default function TicketTypeDialog(props: ITicketTypeDialog) {
  const { t } = useTranslation('common');
  const { open, initial, original, onClose } = props;
  const { control, loading, onSubmit, reset } = useForm({
    initial: {
      name: original?.name || initial?.name,
      cost: original?.costCents != null ? fromCents(original.costCents) : initial?.cost,
      allowManifestingSelf: original?.allowManifestingSelf || initial?.allowManifestingSelf,
      defaultDestinationId:
        original?.defaultDestination?.id ?? initial?.defaultDestinationId ?? null,
      extras: original?.extras || initial?.extras,
      id: original?.id || initial?.id || undefined,
      requiresEscort: original?.requiresEscort || initial?.requiresEscort,
      minAge: limitText(original?.participantLimits, 'min_age') ?? initial?.minAge,
      maxAge: limitText(original?.participantLimits, 'max_age') ?? initial?.maxAge,
      minBodyMassKg:
        limitText(original?.participantLimits, 'min_body_mass_kg') ?? initial?.minBodyMassKg,
      maxBodyMassKg:
        limitText(original?.participantLimits, 'max_body_mass_kg') ?? initial?.maxBodyMassKg,
      escortCapacity: original?.escortCapacity ?? initial?.escortCapacity,
    },
    onSuccess: onClose,
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <ResourceForm
      onArchive={props.onArchive}
      {...{ open, loading, onClose }}
      title={original?.id ? t('forms.ticket_type.editTicket') : t('forms.ticket_type.newTicket')}
      onSubmit={onSubmit}
    >
      <TicketTypeForm {...{ control }} />
    </ResourceForm>
  );
}
