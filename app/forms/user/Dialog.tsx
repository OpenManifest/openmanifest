import * as React from 'react';
import type { MembershipDetailsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import UserForm from './UserForm';
import useUserForm from './useForm';

export interface IUserDialogProps {
  open: boolean;
  /** The member being edited */
  membership?: MembershipDetailsFragment | null;
  onClose(): void;
  onSuccess?(): void;
}

export default function UserDialog(props: IUserDialogProps) {
  const { open, membership, onClose, onSuccess } = props;
  const { control, loading, onSubmit } = useUserForm({
    membership,
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
