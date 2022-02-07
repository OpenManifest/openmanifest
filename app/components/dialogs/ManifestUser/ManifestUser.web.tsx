import { useManifestUserMutation } from 'app/api/reflection';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import * as React from 'react';
import { usePortal } from '@gorhom/portal';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import SlotForm from '../../forms/manifest/ManifestForm';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { onSuccess, open, onClose } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifest);
  const [mutationCreateSlot, mutationData] = useManifestUserMutation();
  const portal = usePortal('drawer');

  React.useEffect(() => {
    if (!open) {
      portal.removePortal('drawer');
    }
  }, [open, portal]);

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
      if (error instanceof Error) {
        dispatch(
          actions.notifications.showSnackbar({
            message: error.message,
            variant: 'error',
          })
        );
      }
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
    <DialogOrSheet
      // eslint-disable-next-line max-len
      title={`Manifest ${state?.fields?.dropzoneUser?.value?.user?.name} on ${state.fields.load?.value?.name}`}
      loading={mutationData.loading}
      {...{ open }}
      buttonLabel="Manifest"
      onClose={() => {
        dispatch(actions.forms.manifest.reset());
        onClose();
      }}
      buttonAction={onManifest}
    >
      <SlotForm />
    </DialogOrSheet>
  );
}
