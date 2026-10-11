import * as React from 'react';
import type { DropzoneUserDetailsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import UserForm from './UserForm';
import useUserForm from './useForm';

export interface IUserDialogProps {
  open: boolean;
  /** The member being edited */
  dropzoneUser?: DropzoneUserDetailsFragment | null;
  onClose(): void;
  onSuccess?(): void;
}

export default function UserDialog(props: IUserDialogProps) {
  const { open, dropzoneUser, onClose, onSuccess } = props;
  const { control, loading, onSubmit } = useUserForm({
    dropzoneUser,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  return (
    <DialogOrSheet
      title="Update information"
      open={open}
      loading={loading}
      onClose={onClose}
      buttonAction={onSubmit}
      buttonLabel="Save"
    >
      <UserForm {...{ control }} />
    </DialogOrSheet>
  );
}
