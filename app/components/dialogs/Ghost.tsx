import * as React from 'react';
import GhostForm from '../forms/ghost/GhostForm';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import DialogOrSheet from '../layout/DialogOrSheet';
import useMutationCreateGhost from '../../api/hooks/useMutationCreateGhost';
import { GhostFields } from '../forms/ghost/slice';

interface ICreateGhostDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}
export default function CreateGhostDialog(props: ICreateGhostDialog) {
  const { open, onSuccess, onClose } = props;
  const state = useAppSelector((root) => root.forms.ghost);
  const globalState = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const mutationCreateGhost = useMutationCreateGhost({
    onSuccess: (payload) => {
      requestAnimationFrame(() => {
        onSuccess();
        dispatch(
          actions.notifications.showSnackbar({
            message: `${payload?.user?.name} has been added to your dropzone`,
            variant: 'success',
          })
        );
      });
    },
    onFieldError: (field, value) => {
      dispatch(actions.forms.ghost.setFieldError([field as keyof GhostFields, value]));
    },

    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
  });

  const onSave = React.useCallback(async () => {
    mutationCreateGhost.mutate({
      dropzoneId: globalState.currentDropzoneId as number,
      name: state.fields.name.value || '',
      licenseId: !state.fields.license.value?.id ? null : Number(state.fields.license.value?.id),
      phone: state.fields.phone.value,
      exitWeight: Number(state.fields.exitWeight.value),
      email: state.fields.email.value || '',
      roleId: Number(state.fields.role.value?.id),
    });
  }, [
    mutationCreateGhost,
    globalState.currentDropzoneId,
    state.fields.name.value,
    state.fields.license.value?.id,
    state.fields.phone.value,
    state.fields.exitWeight.value,
    state.fields.email.value,
    state.fields.role.value?.id,
  ]);

  const snapPoints = React.useMemo(() => [400, 740], []);
  return (
    <DialogOrSheet
      title="Pre-register user"
      open={open}
      snapPoints={snapPoints}
      loading={mutationCreateGhost.loading}
      onClose={onClose}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <GhostForm />
    </DialogOrSheet>
  );
}
