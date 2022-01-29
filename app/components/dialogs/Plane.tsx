import * as React from 'react';
import { useCreatePlaneMutation, useUpdatePlaneMutation } from 'app/api/reflection';
import { actions, useAppSelector, useAppDispatch } from '../../state';

import PlaneForm from '../forms/plane/PlaneForm';
import DialogOrSheet from '../layout/DialogOrSheet';
import useCurrentDropzone from '../../api/hooks/useCurrentDropzone';

interface IPlaneDialogProps {
  open: boolean;
  onClose(): void;
}

export default function CreatePlaneScreen(props: IPlaneDialogProps) {
  const { open, onClose } = props;
  const currentDropzone = useCurrentDropzone();
  const state = useAppSelector((root) => root.forms.plane);
  const dispatch = useAppDispatch();

  const [mutationCreatePlane, create] = useCreatePlaneMutation();
  const [mutationUpdatePlane, update] = useUpdatePlaneMutation();

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if ((state.fields.name.value || '').length < 3) {
      hasError = true;
      dispatch(actions.forms.plane.setFieldError(['name', 'Name is too short']));
    }

    if ((state.fields.registration.value || '').length < 3) {
      hasError = true;
      dispatch(actions.forms.plane.setFieldError(['registration', 'Registration is too short']));
    }

    if (!state.fields.maxSlots.value) {
      hasError = true;
      dispatch(actions.forms.plane.setFieldError(['maxSlots', 'Max slots must be specified']));
    }

    return !hasError;
  }, [
    dispatch,
    state.fields.maxSlots.value,
    state.fields.name.value,
    state.fields.registration.value,
  ]);

  const onUpdatePlane = React.useCallback(async () => {
    const { name, registration, maxSlots, minSlots } = state.fields;

    if (validate()) {
      try {
        const result = await mutationUpdatePlane({
          variables: {
            id: Number(state.original?.id),
            name: name.value || '',
            registration: registration.value || '',
            minSlots: minSlots.value || 0,
            maxSlots: maxSlots.value || 0,
          },
        });

        const payload = result?.data?.updatePlane;

        if (payload?.fieldErrors?.length) {
          payload.fieldErrors.forEach(({ field, message }) => {
            switch (field) {
              case 'max_slots':
                return dispatch(actions.forms.plane.setFieldError(['maxSlots', message]));
              case 'name':
                return dispatch(actions.forms.plane.setFieldError(['name', message]));
              case 'min_slots':
                return dispatch(actions.forms.plane.setFieldError(['minSlots', message]));
              case 'registration':
                return dispatch(actions.forms.plane.setFieldError(['registration', message]));
              default:
                return null;
            }
          });
          return;
        }

        if (payload?.errors?.length) {
          payload.errors.forEach((message) =>
            dispatch(actions.notifications.showSnackbar({ message, variant: 'error' }))
          );
        }

        if (payload?.plane) {
          const plane = payload?.plane;
          dispatch(
            actions.notifications.showSnackbar({
              message: `Added plane ${plane.name}`,
              variant: 'success',
            })
          );
          onClose();
          dispatch(actions.forms.plane.reset());
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
    }
  }, [dispatch, mutationUpdatePlane, onClose, state.fields, state.original?.id, validate]);

  const onCreate = React.useCallback(async () => {
    const { name, registration, maxSlots, minSlots } = state.fields;

    if (validate()) {
      try {
        const result = await mutationCreatePlane({
          variables: {
            dropzoneId: Number(currentDropzone?.dropzone?.id),
            name: name.value || '',
            registration: registration.value || '',
            minSlots: minSlots.value || 0,
            maxSlots: maxSlots.value || 0,
          },
        });

        const payload = result?.data?.createPlane;

        if (payload?.fieldErrors?.length) {
          payload.fieldErrors.forEach(({ field, message }) => {
            switch (field) {
              case 'max_slots':
                return dispatch(actions.forms.plane.setFieldError(['maxSlots', message]));
              case 'name':
                return dispatch(actions.forms.plane.setFieldError(['name', message]));
              case 'min_slots':
                return dispatch(actions.forms.plane.setFieldError(['minSlots', message]));
              case 'registration':
                return dispatch(actions.forms.plane.setFieldError(['registration', message]));
              default:
                return null;
            }
          });
          return;
        }

        if (payload?.errors?.length) {
          payload.errors.forEach((message) =>
            dispatch(actions.notifications.showSnackbar({ message, variant: 'error' }))
          );
        }

        if (payload?.plane) {
          const plane = payload?.plane;
          dispatch(
            actions.notifications.showSnackbar({
              message: `Added plane ${plane.name}`,
              variant: 'success',
            })
          );
          onClose();
          dispatch(actions.forms.plane.reset());
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
    }
  }, [
    currentDropzone?.dropzone?.id,
    dispatch,
    mutationCreatePlane,
    onClose,
    state.fields,
    validate,
  ]);

  const onSave = React.useMemo(() => {
    if (state.original?.id) {
      return onUpdatePlane;
    }
    return onCreate;
  }, [onCreate, onUpdatePlane, state.original?.id]);

  const snapPoints = React.useMemo(() => [580, '80%'], []);
  const onDialogClose = React.useCallback(() => {
    onClose();
    dispatch(actions.forms.plane.reset());
  }, [dispatch, onClose]);

  return (
    <DialogOrSheet
      title={state.original?.id ? 'Edit aircraft' : 'New aircraft'}
      open={open}
      snapPoints={snapPoints}
      buttonLabel="Save"
      buttonAction={onSave}
      loading={create.loading || update.loading}
      onClose={onDialogClose}
    >
      <PlaneForm />
    </DialogOrSheet>
  );
}
