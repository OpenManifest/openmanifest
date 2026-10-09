import * as React from 'react';
import type { RigEssentialsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import RigForm from './RigForm';
import useRigForm from './useForm';

export interface IRigDialogProps {
  open?: boolean;
  /** The rig being edited; a new rig when absent */
  rig?: RigEssentialsFragment | null;
  dropzoneId?: number;
  userId?: number;
  onClose(): void;
  onSuccess?(): void;
}

export default function RigDialog(props: IRigDialogProps) {
  const { open, rig, dropzoneId, userId, onClose, onSuccess } = props;
  const { control, loading, onSubmit } = useRigForm({
    rig,
    dropzoneId,
    userId,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const snapPoints = React.useMemo(() => [580], []);

  return (
    <DialogOrSheet
      title={rig?.id ? 'Edit rig' : 'New rig'}
      open={open}
      snapPoints={snapPoints}
      onClose={onClose}
      buttonAction={onSubmit}
      buttonLabel="Save"
      loading={loading}
    >
      <RigForm {...{ control }} showTypeSelect={!!dropzoneId} />
    </DialogOrSheet>
  );
}
