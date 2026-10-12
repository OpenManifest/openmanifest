import * as React from 'react';
import type { RigEssentialsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import RigForm from './RigForm';
import useRigForm from './useForm';

export interface IRigDialogProps {
  open?: boolean;
  /** The rig being edited; a new rig when absent */
  rig?: RigEssentialsFragment | null;
  operatorId?: number;
  userId?: number;
  onClose(): void;
  onSuccess?(): void;
}

export default function RigDialog(props: IRigDialogProps) {
  const { open, rig, operatorId, userId, onClose, onSuccess } = props;
  const { control, loading, onSubmit } = useRigForm({
    rig,
    operatorId,
    userId,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  return (
    <DialogOrSheet
      title={rig?.id ? 'Edit rig' : 'New rig'}
      open={open}
      onClose={onClose}
      buttonAction={onSubmit}
      buttonLabel="Save"
      loading={loading}
    >
      <RigForm {...{ control }} showTypeSelect={!!operatorId} />
    </DialogOrSheet>
  );
}
