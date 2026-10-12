import * as React from 'react';

import { LoadDetailsFragment } from 'app/api/operations';

import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import LoadForm from './LoadForm';
import useForm from './useForm';
import { useTranslation } from 'react-i18next';

export interface ILoadDialog {
  open?: boolean;
  load?: LoadDetailsFragment;
  onClose(): void;
  onSuccess(load: LoadDetailsFragment): void;
}
export default function LoadDialog(props: ILoadDialog) {
  const { t } = useTranslation('common');
  const { open, load, onClose, onSuccess } = props;
  const { control, onSubmit, loading } = useForm({
    initial: {
      gca: load?.gca,
      maxSlots: load?.maxSlots,
      name: load?.name,
      pilot: load?.pilot,
      vehicle: load?.vehicle,
      id: load?.id,
    },
    onSuccess,
  });

  return (
    <DialogOrSheet
      open={open}
      onClose={onClose}
      buttonAction={onSubmit}
      scrollable
      buttonLabel={t('forms.create')}
      loading={loading}
      title={t('forms.load.newLoad')}
    >
      <LoadForm {...{ control }} />
    </DialogOrSheet>
  );
}
