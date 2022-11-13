import * as React from 'react';

import { LoadDetailsFragment } from 'app/api/operations';

import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import LoadForm from './LoadForm';
import useForm from './useForm';

export interface ILoadDialog {
  open?: boolean;
  load?: LoadDetailsFragment;
  onClose(): void;
  onSuccess(load: LoadDetailsFragment): void;
}
export default function LoadDialog(props: ILoadDialog) {
  const { open, load, onClose, onSuccess } = props;
  const { control, onSubmit, loading } = useForm({
    initial: {
      gca: load?.gca,
      maxSlots: load?.maxSlots,
      name: load?.name,
      pilot: load?.pilot,
      plane: load?.plane,
      id: load?.id,
    },
    onSuccess,
  });

  const snapPoints = React.useMemo(() => ['30%', 650], []);

  return (
    <DialogOrSheet
      open={open}
      onClose={onClose}
      buttonAction={onSubmit}
      scrollable
      buttonLabel="Create"
      snapPoints={snapPoints}
      loading={loading}
      title="New Load"
    >
      <LoadForm {...{ control }} />
    </DialogOrSheet>
  );
}
