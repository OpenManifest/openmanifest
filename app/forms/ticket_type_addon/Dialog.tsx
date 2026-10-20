import * as React from 'react';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import { TicketTypeAddonDetailsFragment } from 'app/api/operations';
import TicketTypeForm from './TicketAddonForm';
import useForm from './useForm';
import type { TicketTypeAddonFields } from './useForm';
import { fromCents } from 'app/utils/money';
import { useTranslation } from 'react-i18next';

export interface ITicketTypeAddonDialog {
  open: boolean;
  original?: TicketTypeAddonDetailsFragment;
  initial?: Partial<TicketTypeAddonFields>;
  onClose(): void;
}

export default function TicketTypeDialog(props: ITicketTypeAddonDialog) {
  const { t } = useTranslation('common');
  const { open, initial, original, onClose } = props;
  const { control, loading, onSubmit } = useForm({
    initial: {
      name: original?.name || initial?.name,
      cost: original?.costCents != null ? fromCents(original.costCents) : initial?.cost,
      ticketTypes: original?.ticketTypes || initial?.ticketTypes || [],
      id: original?.id || initial?.id || undefined,
    },
    onSuccess: onClose,
  });

  return (
    <DialogOrSheet
      {...{ open, loading, onClose }}
      title={
        original?.id
          ? t('forms.ticket_type_addon.editTicket')
          : t('forms.ticket_type_addon.newTicket')
      }
      buttonAction={onSubmit}
      buttonLabel={t('forms.save')}
    >
      <TicketTypeForm {...{ control }} />
    </DialogOrSheet>
  );
}
