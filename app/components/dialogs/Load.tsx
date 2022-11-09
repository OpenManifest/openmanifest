import * as React from 'react';

import { useManifestContext } from 'app/api/crud/useManifest/useManifest';
import { LoadDetailsFragment } from 'app/api/operations';
import { actions, useAppSelector, useAppDispatch } from '../../state';
import { actions as snackbar } from '../notifications';

import { LoadState } from '../../api/schema.d';
import LoadForm from '../forms/load/LoadForm';
import DialogOrSheet from '../layout/DialogOrSheet';
import { LoadFields } from '../forms/load/slice';

interface ILoadDialog {
  open: boolean;
  onClose(): void;
  onSuccess(load: LoadDetailsFragment): void;
}
export default function LoadDialog(props: ILoadDialog) {
  const { open, onClose, onSuccess } = props;
  const state = useAppSelector((root) => root.forms.load);
  const [submitting, setSubmitting] = React.useState(false);

  const dispatch = useAppDispatch();
  const { createLoad } = useManifestContext();

  const snapPoints = React.useMemo(() => ['30%', 650], []);

  const onSave = React.useCallback(
    async function onCreateLoad() {
      try {
        setSubmitting(true);
        const result = await createLoad({
          name: state.fields.name.value,
          state: LoadState.Open,
          maxSlots: state.fields.maxSlots.value || null,
          plane: Number(state.fields.plane.value?.id) || null,
          gca: Number(state.fields.gca.value?.id) || null,
          pilot: Number(state.fields.pilot.value?.id) || null,
        });

        if ('error' in result && result.error) {
          dispatch(actions.notifications.showSnackbar({ message: result.error, variant: 'error' }));
        }

        if ('fieldErrors' in result) {
          result.fieldErrors?.forEach(({ field, message }) => {
            dispatch(actions.forms.load.setFieldError([field as keyof LoadFields, message]));
          });
        }

        if ('load' in result) {
          if (result.load?.id) {
            dispatch(
              snackbar.showSnackbar({
                message: `Load ${result?.load?.name || `#${result?.load?.loadNumber}`} created`,
                variant: 'success',
              })
            );

            if (result?.load) {
              onSuccess(result.load);
            }
            dispatch(actions.forms.load.reset());
            requestAnimationFrame(() => dispatch(actions.forms.load.setOpen(false)));
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
    [
      createLoad,
      dispatch,
      onSuccess,
      state.fields.gca.value?.id,
      state.fields.maxSlots.value,
      state.fields.name.value,
      state.fields.pilot.value?.id,
      state.fields.plane.value?.id,
    ]
  );

  return (
    <DialogOrSheet
      open={open}
      onClose={onClose}
      buttonAction={onSave}
      scrollable
      buttonLabel="Create"
      snapPoints={snapPoints}
      loading={submitting}
      title="New Load"
    >
      <LoadForm />
    </DialogOrSheet>
  );
}
