import * as React from 'react';
import useMutationCreateExtra from '../../api/hooks/useMutationCreateExtra';
import useMutationUpdateExtra from '../../api/hooks/useMutationUpdateExtra';
import { actions, useAppSelector, useAppDispatch } from '../../state';
import ExtraForm from '../forms/extra/ExtraForm';
import DialogOrSheet from '../layout/DialogOrSheet';
import useCurrentDropzone from '../../api/hooks/useCurrentDropzone';
import { ExtraFields } from '../forms/extra/slice';

interface ITicketTypeExtraDialog {
  open: boolean;
  onClose(): void;
}
export default function TicketTypeExtraDialog(props: ITicketTypeExtraDialog) {
  const { open, onClose } = props;
  const currentDropzone = useCurrentDropzone();
  const state = useAppSelector((root) => root.forms.extra);
  const dispatch = useAppDispatch();

  const createExtra = useMutationCreateExtra({
    onSuccess: (payload) =>
      requestAnimationFrame(() => {
        dispatch(
          actions.notifications.showSnackbar({
            message: `Saved ${payload?.extra?.name}`,
            variant: 'success',
          })
        );
        onClose();
        dispatch(actions.forms.extra.reset());
      }),

    onFieldError: (field, message) =>
      dispatch(actions.forms.extra.setFieldError([field as keyof ExtraFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });
  const updateExtra = useMutationUpdateExtra({
    onSuccess: (payload) =>
      requestAnimationFrame(() => {
        dispatch(
          actions.notifications.showSnackbar({
            message: `Saved ${payload?.extra?.name}`,
            variant: 'success',
          })
        );
        onClose();
        dispatch(actions.forms.extra.reset());
      }),

    onFieldError: (field, message) =>
      dispatch(actions.forms.extra.setFieldError([field as keyof ExtraFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });

  const onSave = React.useCallback(async () => {
    if (state?.original?.id) {
      updateExtra.mutate({
        id: Number(state.original.id),
        dropzoneId: Number(currentDropzone?.dropzone?.id),
        name: state.fields.name.value,
        cost: state.fields.cost.value,
        ticketTypeIds: state.fields.ticketTypes.value?.map(({ id }) => Number(id)),
      });
    } else {
      createExtra.mutate({
        dropzoneId: Number(currentDropzone?.dropzone?.id),
        name: state.fields.name.value,
        cost: state.fields.cost.value,
        ticketTypeIds: state.fields.ticketTypes.value?.map(({ id }) => Number(id)),
      });
    }
  }, [
    createExtra,
    currentDropzone?.dropzone?.id,
    state.fields.cost.value,
    state.fields.name.value,
    state.fields.ticketTypes.value,
    state.original?.id,
    updateExtra,
  ]);

  const snapPoints = React.useMemo(() => [300, 500], []);

  return (
    <DialogOrSheet
      title={state.original?.id ? 'Edit ticket addon' : 'New ticket addon'}
      open={open}
      onClose={onClose}
      loading={createExtra.loading || updateExtra.loading}
      buttonAction={onSave}
      buttonLabel="Save"
      snapPoints={snapPoints}
    >
      <ExtraForm />
    </DialogOrSheet>
  );
}
