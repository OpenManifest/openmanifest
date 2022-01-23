import { useManifestUserMutation } from 'app/api/reflection';
import * as React from 'react';
import { ScrollView } from 'react-native';
import { Button, Dialog, Portal, ProgressBar } from 'react-native-paper';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import SlotForm from '../../forms/manifest/ManifestForm';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { onSuccess, open } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifest);
  const globalState = useAppSelector((root) => root.global);
  const [mutationCreateSlot, mutationData] = useManifestUserMutation();

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifest.setFieldError(['jumpType', 'You must specify the type of jump'])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifest.setFieldError([
          'ticketType',
          'You must select a ticket type to manifest',
        ])
      );
    }

    return !hasErrors;
  }, [dispatch, state.fields.jumpType.value?.id, state.fields.ticketType.value?.id]);
  const onManifest = React.useCallback(async () => {
    if (!validate()) {
      return;
    }
    try {
      const result = await mutationCreateSlot({
        variables: {
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
        },
      });

      result.data?.createSlot?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'jump_type':
            return dispatch(actions.forms.manifest.setFieldError(['jumpType', message]));
          case 'load':
            return dispatch(actions.forms.manifest.setFieldError(['load', message]));
          case 'credits':
          case 'extras':
          case 'extra_ids':
            return dispatch(actions.forms.manifest.setFieldError(['extras', message]));
          case 'ticket_type':
            return dispatch(actions.forms.manifest.setFieldError(['ticketType', message]));
          case 'rig':
            return dispatch(actions.forms.manifest.setFieldError(['rig', message]));
          case 'dropzone_user':
            return dispatch(actions.forms.manifest.setFieldError(['dropzoneUser', message]));
          case 'exit_weight':
            return dispatch(actions.forms.manifest.setFieldError(['exitWeight', message]));
          default:
            return null;
        }
      });
      if (result?.data?.createSlot?.errors?.length) {
        dispatch(
          actions.notifications.showSnackbar({
            message: result?.data?.createSlot?.errors[0],
            variant: 'error',
          })
        );
        return;
      }
      if (!result.data?.createSlot?.fieldErrors?.length) {
        onSuccess();
      }
    } catch (error) {
      dispatch(
        actions.notifications.showSnackbar({
          message: error.message,
          variant: 'error',
        })
      );
    }
  }, [
    dispatch,
    mutationCreateSlot,
    onSuccess,
    state.fields.dropzoneUser?.value?.id,
    state.fields.exitWeight.value,
    state.fields.extras?.value,
    state.fields.jumpType.value?.id,
    state.fields.load.value?.id,
    state.fields.passengerExitWeight?.value,
    state.fields.passengerName?.value,
    state.fields.rig.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.ticketType.value?.isTandem,
    validate,
  ]);

  return (
    <Portal>
      <Dialog visible={!!open} style={{ maxWidth: 500, alignSelf: 'center' }}>
        <ProgressBar
          indeterminate
          visible={mutationData.loading}
          color={globalState.theme.colors.accent}
        />
        <Dialog.Title>
          {/* eslint-disable-next-line max-len */}
          {`Manifest ${state?.fields?.dropzoneUser?.value?.user?.name} on ${state.fields.load?.value?.name}`}
        </Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <SlotForm />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
          <Button
            onPress={() => {
              dispatch(actions.forms.manifest.reset());
              props.onClose();
            }}
          >
            Cancel
          </Button>
          <Button onPress={onManifest}>Manifest</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
