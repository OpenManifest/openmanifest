import * as React from 'react';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import GhostForm from './Form';
import useForm, { UserFields } from './useForm';

export interface ICreateGhostDialog {
  open?: boolean;
  original?: DropzoneUserEssentialsFragment;
  initial?: Partial<UserFields>;
  onClose(): void;
}
export default function CreateGhostDialog(props: ICreateGhostDialog) {
  const { open, onClose, initial, original } = props;
  const { control, loading, onSubmit, reset } = useForm({
    initial: {
      name: original?.user?.name || initial?.name,
      nickname: original?.user?.nickname || initial?.nickname,
      phone: original?.user?.phone || initial?.phone,
      license: original?.license || initial?.license,
      federation: initial?.federation,
      email: original?.user?.email || initial?.email,
      role: original?.role || initial?.role,
      id: original?.id || initial?.id || undefined,
    },
    onSuccess: onClose,
  });
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const snapPoints = React.useMemo(() => [400, 740], []);
  return (
    <DialogOrSheet
      title="Pre-register user"
      {...{ open, loading, onClose, snapPoints }}
      buttonAction={onSubmit}
      buttonLabel="Create"
    >
      <GhostForm {...{ control }} />
    </DialogOrSheet>
  );
}
