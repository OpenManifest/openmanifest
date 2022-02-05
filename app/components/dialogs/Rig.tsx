import * as React from 'react';
import useMutationCreateRig from '../../api/hooks/useMutationCreateRig';
import useMutationUpdateRig from '../../api/hooks/useMutationUpdateRig';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import RigForm from '../forms/rig/RigForm';
import { RigFields } from '../forms/rig/slice';
import DialogOrSheet from '../layout/DialogOrSheet';

interface IRigDialog {
  open?: boolean;
  dropzoneId?: number;
  userId?: number;
  onClose(): void;
  onSuccess(): void;
}

export default function RigDialog(props: IRigDialog) {
  const { open, dropzoneId, onClose, onSuccess, userId } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.rig);

  const updateRig = useMutationUpdateRig({
    onSuccess: (payload) =>
      requestAnimationFrame(() => {
        console.log(payload);
        onSuccess();
      }),

    onFieldError: (field, message) =>
      dispatch(actions.forms.rig.setFieldError([field as keyof RigFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });
  const createRig = useMutationCreateRig({
    onSuccess: (payload) => requestAnimationFrame(() => onSuccess()),
    onFieldError: (field, message) =>
      dispatch(actions.forms.rig.setFieldError([field as keyof RigFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });

  const isLoading = updateRig.loading || createRig.loading;

  const onSave = React.useCallback(async () => {
    if (state.original?.id) {
      const params = {
        id: Number(state.original?.id),
        name: state.fields.name.value,
        make: state.fields.make.value,
        model: state.fields.model.value,
        serial: state.fields.serial.value,
        canopySize: state.fields.canopySize.value,
        rigType: state.fields.rigType.value,
        repackExpiresAt: state.fields.repackExpiresAt.value,
        userId: userId ? Number(userId) : null,
        dropzoneId: dropzoneId ? Number(dropzoneId) : null,
      };
      console.log(params);
      const d = await updateRig.mutate(params);
      console.log(d);
    } else {
      const x = await createRig.mutate({
        name: state.fields.name.value,
        make: state.fields.make.value,
        model: state.fields.model.value,
        serial: state.fields.serial.value,
        canopySize: state.fields.canopySize.value,
        rigType: state.fields.rigType.value,
        repackExpiresAt: state.fields.repackExpiresAt.value,
        userId: userId ? Number(userId) : null,
        dropzoneId: dropzoneId ? Number(dropzoneId) : null,
      });
      console.log(x);
    }
  }, [
    createRig,
    dropzoneId,
    state.fields.canopySize.value,
    state.fields.make.value,
    state.fields.model.value,
    state.fields.repackExpiresAt.value,
    state.fields.rigType.value,
    state.fields.name.value,
    state.fields.serial.value,
    state.original?.id,
    updateRig,
    userId,
  ]);

  const snapPoints = React.useMemo(() => [580], []);
  const onDialogClose = React.useCallback(() => {
    requestAnimationFrame(() => {
      onClose();
      dispatch(actions.forms.rig.reset());
    });
  }, [dispatch, onClose]);

  return (
    <DialogOrSheet
      title={state.original?.id ? 'Edit rig' : 'New rig'}
      open={open}
      snapPoints={snapPoints}
      onClose={onDialogClose}
      buttonAction={onSave}
      buttonLabel="Savezz"
      loading={isLoading}
    >
      <RigForm showTypeSelect={!!dropzoneId} />
    </DialogOrSheet>
  );
}
