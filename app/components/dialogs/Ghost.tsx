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
    onSuccess: (payload) => null,
    onFieldError: (field, value) => {
      dispatch(actions.forms.ghost.setFieldError([field as keyof GhostFields, value]));
      console.log(field, value);
    },

    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
  });

  const onSave = React.useCallback(async () => {
    const { name, license, phone, email, exitWeight, role } = state.fields;
    try {
      await mutationCreateGhost.mutate({
        dropzoneId: globalState.currentDropzoneId as number,
        name: name.value || '',
        licenseId: !license.value?.id ? null : Number(license.value?.id),
        phone: phone.value,
        exitWeight: Number(exitWeight.value),
        email: email.value || '',
        roleId: Number(role?.value?.id),
      });

      onSuccess();
      dispatch(
        actions.notifications.showSnackbar({
          message: `Profile has been updated`,
          variant: 'success',
        })
      );
      dispatch(actions.forms.ghost.reset());
    } catch (error) {
      dispatch(
        actions.notifications.showSnackbar({
          message: error.message,
          variant: 'error',
        })
      );
    }
  }, [state.fields, mutationCreateGhost, globalState.currentDropzoneId, onSuccess, dispatch]);

  return (
    <DialogOrSheet
      title="Pre-register user"
      open={open}
      snapPoints={[0, 400, 740]}
      loading={mutationCreateGhost.loading}
      onClose={onClose}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <GhostForm />
    </DialogOrSheet>
  );
}
