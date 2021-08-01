import * as React from 'react';
import useMutationCreateSlot from '../../../api/hooks/useMutationCreateSlot';
import { ManifestUserFields } from '../../forms/manifest/slice';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import ManifestForm from '../../forms/manifest/ManifestForm';
import DialogOrSheet from '../../layout/DialogOrSheet';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { open, onSuccess, onClose } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifest);
  const createSlot = useMutationCreateSlot({
    onSuccess: (payload) => {
      dispatch(actions.forms.manifest.reset());
      onSuccess();
    },

    onFieldError: (field, message) =>
      dispatch(actions.forms.manifest.setFieldError([field as keyof ManifestUserFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });

  const onManifest = React.useCallback(async () => {
    createSlot.mutate({
      jumpTypeId: Number(state.fields.jumpType.value?.id),
      extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
      loadId: Number(state.fields.load.value?.id),
      rigId: !state.fields.rig.value?.id ? null : Number(state.fields.rig.value?.id),
      ticketTypeId: Number(state.fields.ticketType?.value?.id),
      dropzoneUserId: Number(state.fields.dropzoneUser?.value?.id),
      exitWeight: state.fields.exitWeight.value,
      ...(!state.fields.ticketType.value?.isTandem
        ? {}
        : {
            passengerName: state.fields.passengerName?.value,
            passengerExitWeight: state.fields.passengerExitWeight?.value,
          }),
    });
  }, [
    createSlot,
    state.fields.jumpType.value?.id,
    state.fields.extras?.value,
    state.fields.load.value?.id,
    state.fields.rig.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.ticketType.value?.isTandem,
    state.fields.dropzoneUser?.value?.id,
    state.fields.exitWeight.value,
    state.fields.passengerName?.value,
    state.fields.passengerExitWeight?.value,
  ]);

  const snapPoints = React.useMemo(() => [600], []);
  const onDialogClose = React.useCallback(() => {
    requestAnimationFrame(() => {
      dispatch(actions.forms.manifest.reset());
      onClose();
    });
  }, [dispatch, onClose]);

  return (
    <DialogOrSheet
      snapPoints={snapPoints}
      onClose={onDialogClose}
      buttonAction={onManifest}
      buttonLabel="Manifest"
      loading={createSlot.loading}
      open={open}
    >
      <ManifestForm />
    </DialogOrSheet>
  );
}
