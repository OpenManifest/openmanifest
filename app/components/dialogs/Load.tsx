import * as React from 'react';

import useMutationCreateLoad from '../../api/hooks/useMutationCreateLoad';
import { actions, useAppSelector, useAppDispatch } from '../../state';
import { actions as snackbar } from '../notifications';

import { Load } from '../../api/schema.d';
import LoadForm from '../forms/load/LoadForm';
import DialogOrSheet from '../layout/DialogOrSheet';
import { LoadFields } from '../forms/load/slice';

interface ILoadDialog {
  open: boolean;
  onClose(): void;
  onSuccess(load: Load): void;
}
export default function LoadDialog(props: ILoadDialog) {
  const { open, onClose, onSuccess } = props;
  const state = useAppSelector((root) => root.forms.load);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const dispatch = useAppDispatch();
  const createLoad = useMutationCreateLoad({
    onSuccess: (payload) => {
      dispatch(
        snackbar.showSnackbar({
          message: `Load ${payload?.load?.name} created`,
          variant: 'success',
        })
      );

      if (payload?.load) {
        onSuccess(payload?.load);
      }
      dispatch(actions.forms.load.reset());
      requestAnimationFrame(() => dispatch(actions.forms.load.setOpen(false)));
    },
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
    onFieldError: (field, message) =>
      dispatch(actions.forms.load.setFieldError([field as keyof LoadFields, message])),
  });

  const snapPoints = React.useMemo(() => ['30%', 650], []);

  const onSave = React.useCallback(() => {
    const variables = {
      isOpen: !!state.fields.isOpen.value,
      name: state.fields.name.value,
      dropzoneId: currentDropzoneId,
      maxSlots: state.fields.maxSlots.value || null,
      planeId: Number(state.fields.plane.value?.id) || null,
      gcaId: Number(state.fields.gca.value?.id) || null,
      pilotId: Number(state.fields.pilot.value?.id) || null,
    };
    createLoad.mutate(variables);
  }, [
    createLoad,
    currentDropzoneId,
    state.fields.gca.value?.id,
    state.fields.isOpen.value,
    state.fields.maxSlots.value,
    state.fields.name.value,
    state.fields.pilot.value?.id,
    state.fields.plane.value?.id,
  ]);

  return (
    <DialogOrSheet
      open={open}
      onClose={onClose}
      buttonAction={onSave}
      scrollable
      buttonLabel="Create"
      snapPoints={snapPoints}
      loading={createLoad.loading}
      title="New Load"
    >
      <LoadForm />
    </DialogOrSheet>
  );
}
