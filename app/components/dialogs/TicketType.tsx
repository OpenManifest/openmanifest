import * as React from 'react';
import { useIsFocused } from '@react-navigation/core';
import useMutationCreateTicketType from 'app/api/hooks/useMutationCreateTicketType';
import useMutationUpdateTicketType from 'app/api/hooks/useMutationUpdateTicketType';
import { actions, useAppSelector, useAppDispatch } from 'app/state';
import { useDropzoneContext } from 'app/providers';
import TicketTypeForm from '../forms/ticket_type/TicketTypeForm';
import DialogOrSheet from '../layout/DialogOrSheet';
import { TicketTypeFields } from '../forms/ticket_type/slice';

interface ITicketTypeDialog {
  open: boolean;
  onClose(): void;
}

export default function TicketTypeDialog(props: ITicketTypeDialog) {
  const { open, onClose } = props;
  const state = useAppSelector((root) => root.forms.ticketType);
  const dispatch = useAppDispatch();
  const { dropzone: currentDropzone } = useDropzoneContext();

  const createTicketType = useMutationCreateTicketType({
    onSuccess: (payload) => {
      dispatch(
        actions.notifications.showSnackbar({
          message: `Saved`,
          variant: 'success',
        })
      );
      dispatch(actions.forms.ticketType.reset());
      onClose();
    },

    onFieldError: (field, message) =>
      dispatch(actions.forms.ticketType.setFieldError([field as keyof TicketTypeFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });
  const updateTicketType = useMutationUpdateTicketType({
    onSuccess: (payload) =>
      requestAnimationFrame(() => {
        dispatch(
          actions.notifications.showSnackbar({
            message: `Saved`,
            variant: 'success',
          })
        );
        dispatch(actions.forms.ticketType.reset());
        onClose();
      }),

    onFieldError: (field, message) =>
      dispatch(actions.forms.ticketType.setFieldError([field as keyof TicketTypeFields, message])),
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      dispatch(actions.forms.ticketType.reset());
    }
  }, [dispatch, isFocused]);

  const onSave = React.useCallback(async () => {
    if (state.original?.id) {
      await updateTicketType.mutate({
        id: Number(state.original?.id),
        name: state.fields.name.value,
        cost: state.fields.cost.value,
        altitude: state.fields.altitude.value,
        allowManifestingSelf: state.fields.allowManifestingSelf.value,
        extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
        isTandem: !!state.fields.isTandem.value,
      });
    } else {
      await createTicketType.mutate({
        dropzoneId: Number(currentDropzone?.dropzone?.id),
        name: state.fields.name.value,
        cost: state.fields.cost.value,
        altitude: state.fields.altitude.value,
        allowManifestingSelf: state.fields.allowManifestingSelf.value,
        extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
        isTandem: !!state.fields.isTandem.value,
      });
    }
  }, [
    createTicketType,
    currentDropzone?.dropzone?.id,
    state.fields.allowManifestingSelf.value,
    state.fields.altitude.value,
    state.fields.cost.value,
    state.fields.extras?.value,
    state.fields.isTandem.value,
    state.fields.name.value,
    state.original?.id,
    updateTicketType,
  ]);

  const snapPoints = React.useMemo(() => [550, 650], []);
  return (
    <DialogOrSheet
      title={state.original?.id ? 'Edit ticket' : 'New ticket'}
      open={open}
      snapPoints={snapPoints}
      onClose={() => {
        onClose();
      }}
      loading={createTicketType.loading || updateTicketType.loading}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <TicketTypeForm />
    </DialogOrSheet>
  );
}
